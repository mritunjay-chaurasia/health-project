import React, { useState, useEffect } from "react";
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
  Tooltip
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { retrieveAllFile } from "apis/upload.api";
import { marked } from 'marked';
import { Box, Button, Paper, Typography, IconButton } from "@mui/material";
import globalSearchStore from "stores/globalSearchStore";

import useUserStore from '../../stores/userStore';

import { fetchExcelData } from "apis/upload.api";
import { AnalyzeModal } from "components/AnalyzeModal/AnalyzeModal";
import './style.css'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
const ReadMore = ({ text, maxLength = 30 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const isTextLong = text?.length > maxLength;
  const displayedText = isExpanded || !isTextLong ? text : `${text.slice(0, maxLength)}...`;

  return (
    <div>
      <span>{displayedText}</span>
      {isTextLong && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <span onClick={toggleReadMore} style={{ cursor: 'pointer', marginLeft: '5px' }}>
            {isExpanded ? 'Show less' : 'Read more'}
          </span>
          <IconButton onClick={toggleReadMore} size="small">
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
      )}
    </div>
  );
};

const Tables = () => {
  const [modal, setModal] = useState(false);
  const { fetchUserData, user } = useUserStore();
  const [summaryContent, setSummaryContent] = useState('');
  const [showReport, setShowReport] = useState(false)
  const [aiResponse, setAiResponse] = useState([])
  const [userDetails, setUserDetails] = useState({})
  const { tableData, tableLoader, tablePage, setTablePage, setTableLoader, setTableData, tableTotalPages, setTableTotalPages } = globalSearchStore();
  const LIMIT = 9;


  const toggleModal = () => setModal(!modal);
  const toggleReportModal = () => setShowReport(!showReport)


  const handleViewSummary = (summary) => {
    setSummaryContent(summary);
    toggleModal();
  };

  const showAIReports = (data, summary, userdetails) => {
    setAiResponse(data)
    setSummaryContent(summary);
    setUserDetails(userdetails)
    setShowReport(true)
  }

  useEffect(() => {
    // Define fetchData inside useEffect and then call it
    const fetchData = async () => {
      try {
        setTableLoader(true);
        const requestData = { page: tablePage, limit: LIMIT };
        const result = await retrieveAllFile(requestData);
        console.log('resulthere', result);
        if (result && result?.status) {
          setTableData(result.files);
          setTableTotalPages(result?.totalPage || 0);
          if (result?.totalPage < tablePage) setTablePage(1);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setTableLoader(false);
      }
    };

    // Call fetchData inside useEffect
    fetchData();
  }, [tablePage]);






  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > tableTotalPages) return;
    setTablePage(newPage);
  };


  const renderKeyValuePairs = (data) => {
    return Object.entries(data)
      .filter(([key, value]) => value !== '' && (Array.isArray(value) ? value.length > 0 : true))
      .map(([key, value]) => {
        const formattedKey = key
          .replace(/_/g, ' ')
          .replace(/^\w/, c => c.toUpperCase());

        return (
          <Box
            key={key}
            p={1}
            mb={1}
            bgcolor="#f7f7f7"
            borderRadius={1}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold" }}
            >
              {formattedKey}:
            </Typography>
            <Typography variant="body2">
              {Array.isArray(value) ? value.join(", ") : value}
            </Typography>
          </Box>
        );
      });
  };

  const [selectedReport, setSelectedReport] = useState(null);
  const [fileName, setFileName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [btnLoader, setBtnLoader] = useState("")

  const handleEditClick = async (report) => {
    // setBtnLoader(report?.id)

    setTooltipOpen(report?.id)
    // const response = await fetchExcelData({ filename: report?.fileName })

    // if (response?.status) {
    //   setSelectedReport({ json: response?.excelJsonData });
    //   setFileName(report?.fileName)
    //   setOpenModal(true);
    // }
    // setBtnLoader("")
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggleTooltip = () => setTooltipOpen("");
  return (
    <>
      {openModal && <AnalyzeModal openModal={openModal} selectedReport={selectedReport} fileName={fileName} setSelectedReport={setSelectedReport} setOpenModal={setOpenModal} showAIReports={showAIReports} />}
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              {tableLoader ? (
                <div className="text-center my-4">
                  <Spinner style={{ width: "3rem", height: "3rem" }} />
                </div>
              ) : tableData?.length === 0 ? (
                <div className="text-center my-4">
                  <h4>No data available</h4>
                </div>
              ) : (
                <Table className="align-items-center table-flush" style={{ scrollbarWidth: "none" }} responsive>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Serial No.</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Date</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Analyze By</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Report Name</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Race</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Gender</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Age</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Result</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Rating</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>Feedback</th>
                      <th scope="col" style={{ fontSize: "0.8rem" }}>reanalyze</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((item, index) => (
                      <tr key={index}>
                        <td style={{ maxWidth: '100px', whiteSpace: 'normal', wordWrap: 'break-word' }} className="text-center">
                          <span className="mb-0 text-sm">{index + 1 ?? ""}</span>
                        </td>
                        <td>
                          {new Date(item.createdAt).toLocaleDateString('en-US')} {new Date(item.createdAt).toLocaleTimeString('en-US')}
                        </td>
                        <td><span className="mb-0 text-sm">{item?.userId?.name ?? ""}</span></td>
                        <td>{item?.fileName}</td>
                        <td>{item?.userDetails?.Race ?? ""}</td>
                        <td>{item?.userDetails?.Gender ?? ""}</td>
                        <td>{item?.userDetails?.Age ?? ""}</td>
                        <td>
                          <Badge color="primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', cursor: 'pointer' }}
                            onClick={() => showAIReports(item.aiResponse, item.summary, item.userDetails)}
                          >
                            View
                          </Badge>
                        </td>
                        {/* <td>
                          <Badge
                            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: "rgb(213 227 237 / 50%)", color: "#1189ef", cursor: 'pointer' }}
                            onClick={() => handleViewSummary(item.summary)}
                          >
                            View
                          </Badge>
                        </td> */}
                        <td>{item.rating}</td>
                        <td
                          style={{
                            maxWidth: '300px', // Adjust as needed
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <span
                              style={{
                                display: 'block',
                                wordWrap: 'break-word',
                                wordBreak: 'break-word',
                              }}
                            >
                              <ReadMore text={item.feedback} />
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge
                            id={`tooltip-${item?.id}`}
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.4rem 1rem',
                              background: "rgb(255 88 124)",
                              color: "#ffffff",
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100px',
                            }}
                            onClick={() => handleEditClick(item)}
                          >
                            {btnLoader === item?.id ? (
                              <Spinner
                                size="sm"
                                color="light"
                                style={{ marginRight: '0.5rem' }}
                              />
                            ) : null}
                            Reanalyze
                          </Badge>

                          {tooltipOpen === item?.id && <Tooltip
                            isOpen={tooltipOpen}
                            target={`tooltip-${item?.id}`}
                            toggle={toggleTooltip}
                            placement="top"
                          >
                            Coming Soon
                          </Tooltip>}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
              {!tableLoader && tableData?.length > 0 && (
                <CardFooter className="py-4">
                  <nav aria-label="...">
                    <Pagination className="pagination justify-content-end mb-0" listClassName="justify-content-end mb-0">
                      <PaginationItem disabled={tablePage <= 1}>
                        <PaginationLink
                          href="#pablo"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(tablePage - 1);
                          }}
                          tabIndex="-1"
                        >
                          <i className="fas fa-angle-left" />
                          <span className="sr-only">Previous</span>
                        </PaginationLink>
                      </PaginationItem>
                      {Array.from({ length: tableTotalPages }, (_, i) => (
                        <PaginationItem key={i} active={tablePage === i + 1}>
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
                      <PaginationItem disabled={tablePage >= tableTotalPages}>
                        <PaginationLink
                          href="#pablo"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(tablePage + 1);
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
          </div>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={toggleModal} style={{ maxWidth: '50rem' }}>
        <ModalHeader style={{ alignSelf: "self" }} toggle={toggleModal}>Summary</ModalHeader>
        <ModalBody style={{ maxHeight: "46rem", overflow: "scroll", scrollbarWidth: "none" }}>

        </ModalBody>
      </Modal>

      <Modal isOpen={showReport} toggle={toggleReportModal} style={{ maxWidth: '60rem' }}>
        <ModalHeader style={{ fontSize: "1.5rem", fontWeight: "bold" }} toggle={toggleReportModal}>Biomarker Details</ModalHeader>
        <ModalBody style={{ maxHeight: "46rem", overflow: "scroll", scrollbarWidth: "none" }}>
          {/* User Details Table */}
          <Typography variant="h5" style={{ marginBottom: '10px' }}>
            User Info
          </Typography>
          <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse' }}>
            <tbody>
              {userDetails?.Name && Object.entries(userDetails)?.map(([key, value]) => (
                <tr key={key}>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                    {key}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Summary Details */}
          <Typography variant="h5" style={{ marginBottom: '10px' }}>
            Summary
          </Typography>
          <div dangerouslySetInnerHTML={{ __html: marked(summaryContent) }} />

          {/* Summary Details */}
          <Typography variant="h5" style={{ marginBottom: '10px' }}>
            Report Details
          </Typography>
          {aiResponse?.length > 0 && aiResponse.map((biomarker, index) => (
            <Paper key={index} elevation={3} style={{ padding: '20px', marginBottom: '20px', width: '100%' }}>
              <Typography variant="h6" style={{ marginBottom: '10px' }}>
                {biomarker.name}
              </Typography>
              {renderKeyValuePairs(biomarker)}
            </Paper>
          ))}
        </ModalBody>
      </Modal>
    </>
  );
};

export default Tables;
