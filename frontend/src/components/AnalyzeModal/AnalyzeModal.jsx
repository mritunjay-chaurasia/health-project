
import {
    Modal,
    ModalBody,
} from "reactstrap";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Box, TextField, IconButton, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { fetchExcelData } from "apis/upload.api";
import { analyzeResponse } from "apis/prompt.api";
import { mergeAiResponses } from "utils";
import Loader from "components/Loader/Loader";
import { NotificationBadge } from "components/NotificationBadge/NotificationBadge";
export const AnalyzeModal = ({ setSelectedReport, selectedReport, fileName, openModal, setOpenModal, showAIReports }) => {
    const navigate = useNavigate();
    const [aiResponse, setAiResponse] = useState([])
    const [loader, setLoader] = useState(false)
    const [notificationBadge, setNotificationBadge] = useState({
        showNotification: false,
        isSuccess: null,
        message: ""
    })
    const [summary, setSummary] = useState("")
    const colors = {
        header: "#8C8CFF",
        background: "#F9F9F9",
        iconColor: "#8C8CFF",
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
    const handleDeleteRow = (index) => {
        const updatedReport = { ...selectedReport };
        updatedReport.json.splice(index, 1);
        setSelectedReport(updatedReport);
    };
    const handleAddRow = () => {
        const updatedReport = { ...selectedReport };
        updatedReport?.json.push({ Biomarker: "", Value: "" });
        setSelectedReport(updatedReport);
    };

    const handleAnalyzeReport = async (report, fileNameDetails) => {
        setLoader(true)
        const response = await fetchExcelData({ filename: fileNameDetails })
        if (response?.status) {
            const result = response?.excelJsonData.map(item => ({
                BiomarkerName: item.Biomarker,
                Value: item.Value,
            }));
            if (result) {
                const response = await analyzeResponse({ excelJsonData: result, fileName: fileNameDetails })
                if (response?.status) {
                    const { aiResponse, aiBiomarkerResponse } = response?.updateFile
                    const mergedResponse = mergeAiResponses(aiResponse, aiBiomarkerResponse)
                    console.log("mergedResponse", mergedResponse)
                    setAiResponse(mergedResponse)
                    setSummary(response?.updateFile?.summary)
                    showAIReports(mergedResponse, response?.updateFile?.summary)
                } else {
                    setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
                }
            }
            handleClose();
            setLoader(false)
        } else {
            setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
        }
    };
    const toggleModal = () => setOpenModal(!openModal);

    return (
        <>
            {loader && <Loader />}
            {notificationBadge?.showNotification && <NotificationBadge notificationBadge={notificationBadge} setNotificationBadge={setNotificationBadge} />}
            <Modal isOpen={openModal} toggle={toggleModal} style={{ maxWidth: '50rem' }}>
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
                            {selectedReport?.json?.map((item, index) => (
                                <Box key={index} display="flex" alignItems="center" mb={2} mt={2} zIndex="1">
                                    <TextField
                                        label="Biomarker"
                                        variant="outlined"
                                        size="small"
                                        value={item.name}
                                        onChange={(e) => handleBiomarkerChange(index, 'Biomarker', e.target.value)}
                                        fullWidth
                                        style={{ marginRight: '10px' }}
                                    />
                                    <TextField
                                        label="Value"
                                        variant="outlined"
                                        size="small"
                                        value={item.value}
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
    )
}