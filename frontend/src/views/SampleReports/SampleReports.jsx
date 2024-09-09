import { Box, Paper, styled, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, IconButton, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { convertExcelFilesToJson, mergeAiResponses } from '../../utils';
import { analyzeResponse } from '../apis/prompt.api';

const colors = {
    header: "#8C8CFF",
    background: "#F9F9F9",
    iconColor: "#8C8CFF",
};

const SampleReports = ({ setAiResponse, setSummary, setResponseId, setNotificationBadge, setLoader }) => {
    const [excelData, setExcelData] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [fileName, setFileName] = useState("")

    const SampleReportSection = styled(Box)({
        height: '420px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        padding: '20px',
        backgroundColor: colors.background,
    });

    useEffect(() => {
        retrieveExcelData();
    }, []);

    const retrieveExcelData = async () => {
        const data = await convertExcelFilesToJson();
        setExcelData(data);
    };

    const handleEditClick = (report) => {
        setSelectedReport({ ...report });
        setFileName(report?.filename)
        setOpenModal(true);
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
        const result = report.json.map(item => ({
            BiomarkerName: item.Biomarker,
            Value: item.Value,
        }));
        if (result) {
            const response = await analyzeResponse({ excelJsonData: result, fileName: fileNameDetails })
            if (response?.status) {
                const { aiResponse, aiBiomarkerResponse } = response?.updateFile
                const mergedResponse = mergeAiResponses(aiResponse, aiBiomarkerResponse)
                setAiResponse(mergedResponse)
                setSummary(response?.updateFile?.summary)
                setResponseId(response?.id)
            } else {
                setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
            }
        }
        console.log("Analyzed Report:", result);
        handleClose();
        setLoader(false)
    };

    return (
        <Paper elevation={3} style={{ padding: '30px', borderRadius: '10px' }}>
            <Typography variant="h6" align="center" gutterBottom>
                Sample Reports
            </Typography>
            <SampleReportSection>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left"><strong>Reports</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {excelData.map((report, index) => (
                                <TableRow key={index}>
                                    <TableCell align="left">{report.filename}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            style={{ marginRight: '5px', background: colors.header }}
                                            onClick={() => handleEditClick(report)}
                                        >
                                            Edit
                                        </Button>
                                        <Button variant="contained"
                                            onClick={() => handleAnalyzeReport(report, report.filename)}
                                            color="info" size="small">Use</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SampleReportSection>

            {/* Modal for Editing Report */}
            <Modal open={openModal} onClose={handleClose}>
                <Box
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: "50rem",
                        backgroundColor: colors.background,
                        padding: '20px',
                        borderRadius: '10px',
                        boxShadow: 24,
                        maxHeight: "46rem",
                        overflowY: "auto",
                        scrollbarWidth: "none", /* Hide scrollbar for Firefox */
                        msOverflowStyle: "none",  /* Hide scrollbar for Internet Explorer and Edge */
                    }}
                    sx={{
                        "&::-webkit-scrollbar": {
                            display: "none", /* Hide scrollbar for Chrome, Safari, and Opera */
                        }
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
                    <Box sx={{
                        marginTop: 2,
                        maxHeight: "40rem",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}>
                        {selectedReport?.json?.map((item, index) => (
                            <Box key={index} display="flex" alignItems="center" mb={2} mt={2}
                                zIndex="1">
                                <TextField
                                    label="Biomarker"
                                    variant="outlined"
                                    size="small"
                                    value={item.Biomarker}
                                    onChange={(e) => handleBiomarkerChange(index, 'Biomarker', e.target.value)}
                                    fullWidth
                                    style={{ marginRight: '10px' }}
                                />
                                <TextField
                                    label="Value"
                                    variant="outlined"
                                    size="small"
                                    value={item.Value}
                                    onChange={(e) => handleBiomarkerChange(index, 'Value', e.target.value)}
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
                            variant="contained"
                            style={{ backgroundColor: colors.header }}
                            onClick={() => handleAnalyzeReport(selectedReport, fileName)}
                        >
                            Analyze Report
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Paper>
    );
};

export default SampleReports;
