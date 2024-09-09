import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Card,
  CardFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { marked } from 'marked';
import { Box, TextField, IconButton, Typography, Button, CircularProgress } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { convertExcelFilesToJson, mergeAiResponses } from '../../utils';
import { analyzeResponse } from '../../apis/prompt.api';
import { fetchExcelData, fetchAllSampleReports } from '../../apis/upload.api';
import Loader from 'components/Loader/Loader';
import { NotificationBadge } from 'components/NotificationBadge/NotificationBadge';
import { BiomarkerView } from '../UploadComponents/BiomarkerView';
import Feedback from "views/Feedback/Feedback";

const colors = {
  header: "#8C8CFF",
  background: "#F9F9F9",
  iconColor: "#8C8CFF",
};

const SampleReportsTables = () => {
  const [excelData, setExcelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const LIMIT = 10;
  const navigate = useNavigate();
  const [aiResponse, setAiResponse] = useState([])
  const [loader, setLoader] = useState(false)
  const [notificationBadge, setNotificationBadge] = useState({
    showNotification: false,
    isSuccess: null,
    message: ""
  })
  const [summary, setSummary] = useState("")
  const [userDetails, setUserDetails] = useState({})
  const [responseId, setResponseId] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [fileName, setFileName] = useState("");


  useEffect(() => {
    retrieveExcelData();
  }, []);


  const retrieveExcelData = async () => {
    try {
      const data = await fetchAllSampleReports();
      setExcelData(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch sample reports:", error);
      setNotificationBadge({ showNotification: true, isSuccess: false, message: "Failed to retrieve data." });
    } finally {
      setLoading(false);
    }
  };



  const [editLoader, setEditLoader] = useState("")
  const handleEditClick = async (report) => {
    setEditLoader(report?.id)
    const response = await fetchExcelData({ filename: report?.filename })
    console.log("report", response)
    if (response?.status) {
      setSelectedReport({ ...report, json: response?.excelJsonData });
      setUserDetails(response?.userDetails)
      setFileName(report?.filename)
      setOpenModal(true);
    } else {
      setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
    }
    setEditLoader("")
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedReport(null);
  };

  const handleBiomarkerChange = (index, field, value) => {
    const updatedReport = { ...selectedReport };
    updatedReport.json[index][field] = value;
    setSelectedReport(updatedReport);
  };

  const handleBiomarkerReferenceRangeChange = (index, field, value) => {
    const updatedReport = { ...selectedReport };
    updatedReport.json[index][field] = value;
    setSelectedReport(updatedReport);
  };

  const handleAddRow = () => {
    const updatedReport = { ...selectedReport };
    updatedReport.json.push({ Biomarker: "", Value: "" });
    setSelectedReport(updatedReport);
  };

  const handleDeleteRow = (index) => {
    const updatedReport = { ...selectedReport };
    updatedReport.json.splice(index, 1);
    setSelectedReport(updatedReport);
  };

  const handleAnalyzeReport = async (report, fileNameDetails) => {
    setLoader(true)
    const response = await analyzeResponse({ excelJsonData: report?.json, fileName: fileNameDetails, userDetails: userDetails })
    console.log("Analyzed Report: response", response);
    if (response?.status) {
      const { aiResponse, aiBiomarkerResponse } = response?.updateFile
      const mergedResponse = mergeAiResponses(aiResponse, aiBiomarkerResponse)
      setAiResponse(mergedResponse)
      setSummary(response?.updateFile?.summary)
      setUserDetails(response?.updateFile?.userDetails)
      setResponseId(response?.id)
    } else {
      setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
    }

    handleClose();
    setLoader(false)
  };

  const handleAnalysis = async (report, fileNameDetails) => {
    setLoader(true)
    const responseFile = await fetchExcelData({ filename: fileNameDetails })
    if (responseFile?.status) {
      const result = responseFile.excelJsonData.map(item => ({
        BiomarkerName: item.name,
        Value: item.value,
      }));
      console.log("Analyzed Report:", { excelJsonData: result, fileName: fileNameDetails, userDetails: responseFile?.userDetails });
      if (result) {
        const response = await analyzeResponse({ excelJsonData: result, fileName: fileNameDetails, userDetails: responseFile?.userDetails })
        console.log("Analyzed Report: response", response);
        if (response?.status) {
          const { aiResponse, aiBiomarkerResponse } = response?.updateFile
          const mergedResponse = mergeAiResponses(aiResponse, aiBiomarkerResponse)
          setAiResponse(mergedResponse)
          setSummary(response?.updateFile?.summary)
          setUserDetails(response?.updateFile?.userDetails)
          setResponseId(response?.id)
        } else {
          setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
        }
      }
      handleClose();
      setLoader(false)
    } else {
      setNotificationBadge({ showNotification: true, isSuccess: false, message: responseFile?.message });
    }
  };

  const toggleModal = () => setOpenModal(!openModal);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleInputChange = (field, value) => {
    setUserDetails((prevReport) => ({
      ...prevReport,
      [field]: value,
    }));
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {loader && <Loader />}
        {notificationBadge?.showNotification && <NotificationBadge notificationBadge={notificationBadge} setNotificationBadge={setNotificationBadge} />}
        <Row>
          <div className="col">
            <div className="upload-report" style={{ textAlign: "right", }}>
              <Button
                onClick={() => navigate('/admin/report-analyzer')}
                sx={{
                  margin: 1,
                  color: "#fff",
                  textTransform: "capitalize",
                  backgroundColor: "#00c0ed",
                  "&:hover": { backgroundColor: "#00c0ed" },
                }}
              >
                Upload Report
              </Button>
            </div>
            {!loader && (aiResponse?.length > 0 || summary) &&
              <div style={{ display: "flex", alignItems: "flex-start", marginTop: "100px", gap: "50px" }}>
                <BiomarkerView data={aiResponse} summary={summary} userDetails={userDetails} />
                <Feedback responseId={responseId} />
              </div>}
            {aiResponse?.length === 0 && (
              <Card className="shadow">
                {loading ? (
                  <div className="text-center my-4">
                    <Spinner style={{ width: "3rem", height: "3rem" }} />
                  </div>
                ) : excelData.length === 0 ? (
                  <div className="text-center my-4">
                    <h4>No data available</h4>
                  </div>
                ) : (
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Serial No.</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Gender</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Age</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Race</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Height</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Weight</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Sample Reports Name</th>
                        <th scope="col" style={{ fontSize: "0.8rem", textAlign: "center" }}>Actions</th>
                        <th scope="col" />
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.map((report, index) => (
                        <tr key={index}>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{index + 1}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.gender}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.age}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.race}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.height}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.weight}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }} >{report?.filename}</td>
                          <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                            <Badge color="primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', cursor: "pointer", textTransform: "capitalize" }}
                              onClick={() => handleEditClick(report)}>
                              {editLoader === report.id ? (
                                <CircularProgress size={14} style={{ color: 'white', marginRight: '0.5rem' }} />
                              ) : "Edit"}
                            </Badge>
                            <Badge
                              style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: "rgb(213 227 237 / 50%)", color: "#1189ef", cursor: 'pointer', marginLeft: "22px", textTransform: "capitalize" }}
                              onClick={() => handleAnalysis(report, report.filename)}
                            >
                              Analyze
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                {!loading && excelData.length > 0 && (
                  <CardFooter className="py-4">
                    <nav aria-label="...">
                      <Pagination className="pagination justify-content-end mb-0" listClassName="justify-content-end mb-0">
                        <PaginationItem disabled={page <= 1}>
                          <PaginationLink
                            href="#pablo"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page - 1);
                            }}
                            tabIndex="-1"
                          >
                            <i className="fas fa-angle-left" />
                            <span className="sr-only">Previous</span>
                          </PaginationLink>
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i} active={page === i + 1}>
                            <PaginationLink
                              href="#pablo"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem disabled={page >= totalPages}>
                          <PaginationLink
                            href="#pablo"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page + 1);
                            }}
                          >
                            <i className="fas fa-angle-right" />
                            <span className="sr-only">Next</span>
                          </PaginationLink>
                        </PaginationItem>
                      </Pagination>
                    </nav>
                  </CardFooter>
                )}
              </Card>
            )}
          </div>
        </Row>
      </Container>

      <Modal isOpen={openModal} toggle={toggleModal} style={{ maxWidth: '60rem' }}>
        <ModalBody>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: colors.background,
              padding: '20px',
              borderRadius: '10px',
              boxShadow: 24,
              maxHeight: '46rem',
              overflowY: 'auto',
            }}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {/* Close Icon */}
            <IconButton
              style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '1001' }}
              onClick={handleClose}
            >
              <CloseIcon style={{ color: "#000051" }} />
            </IconButton>

            <Typography variant="h6" align="center" gutterBottom color="#000051">
              Edit Report
            </Typography>
            <Box
              sx={{
                marginTop: 2,
                maxHeight: "40rem",
                overflowY: "auto",
              }}
            >
              {userDetails?.Name != undefined && Object.keys(userDetails)?.map((key, index) => (
                <TextField
                  key={index}
                  label={key}
                  variant="outlined"
                  size="small"
                  value={userDetails[key]}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  fullWidth
                  style={{ marginBottom: '10px', marginTop: '10px' }}
                />
              ))}

              {selectedReport?.json?.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={2} mt={2} zIndex="1">
                  <TextField
                    label="Biomarker"
                    variant="outlined"
                    size="small"
                    value={item.name}
                    onChange={(e) => handleBiomarkerChange(index, 'name', e.target.value)}
                    fullWidth
                    style={{ marginRight: '10px' }}
                  />
                  <TextField
                    label="Value"
                    variant="outlined"
                    size="small"
                    value={item.value}
                    onChange={(e) => handleBiomarkerChange(index, 'value', e.target.value)}
                    fullWidth
                    style={{ marginRight: '10px' }}
                  />
                  <TextField
                    label="Reference Range"
                    variant="outlined"
                    size="small"
                    value={item?.referenceRange ?? ""}
                    onChange={(e) => handleBiomarkerReferenceRangeChange(index, 'referenceRange', e.target.value)}
                    fullWidth
                  />
                  <IconButton onClick={() => handleDeleteRow(index)}>
                    <DeleteIcon style={{ color: colors.iconColor }} />
                  </IconButton>
                </Box>
              ))}
              <Box display="flex" justifyContent="center" zIndex="1">
                <IconButton onClick={handleAddRow}>
                  <AddCircleIcon style={{ color: colors.iconColor, fontSize: 40 }} />
                </IconButton>
              </Box>
            </Box>

            <Box
              display="flex"
              justifyContent="center"
              mt={3}
              position="sticky"
              bottom="0"
              width="100%"
              backgroundColor={colors.background}
              padding="10px 0"
              zIndex="1000"
            >
              <Button
                sx={{
                  background: "#1189EF",
                  color: "white"
                }}
                onClick={() => handleAnalyzeReport(selectedReport, fileName)}
              >
                Analyze Report
              </Button>
            </Box>
          </Box>
        </ModalBody>
      </Modal>
    </>
  );
};

export default SampleReportsTables;
