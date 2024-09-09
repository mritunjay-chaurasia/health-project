import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Container, styled } from '@mui/system';
import { FileUploader } from 'react-drag-drop-files';
import { uploadFile } from '../../apis/upload.api';
import { NotificationBadge } from 'components/NotificationBadge/NotificationBadge';
import { BiomarkerView } from './BiomarkerView';
import { mergeAiResponses } from '../../utils';
import Loader from 'components/Loader/Loader';
import Header from "components/Headers/Header.js";
import Feedback from "views/Feedback/Feedback";

const UploadBox = styled(Box)({
    width: '300px',
    height: '400px',
    border: '2px dashed #DADADA',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    position: 'relative',
    cursor: 'pointer',
});

const UploadButton = styled(Button)({
    marginTop: '20px',
    width: '200px',
    backgroundColor: 'rgb(13,164,239)',
    textTransform: "capitalize",
    color: '#FFFFFF',
    '&:hover': {
        backgroundColor: 'rgb(13,164,239)',
    },
});

const fileTypes = ["XLS", "XLSX", "XLSM", "CSV"];

export default function UploadComponent() {
    const [files, setFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState("not_started")
    const [fileName, setFileName] = useState("")
    const [aiResponse, setAiResponse] = useState([])
    const [loader, setLoader] = useState(false)
    const [responseId, setResponseId] = useState();
    const [notificationBadge, setNotificationBadge] = useState({
        showNotification: false,
        isSuccess: null,
        message: ""
    })
    const [summary, setSummary] = useState("")
    const [userDetails, setUserDetails] = useState({})
    const handleChange = (file) => {
        setFiles(file);
        setFileName(file?.name ?? "")
        setUploadStatus("locally_uploaded")
    };


    const handleUpload = async () => {
        setLoader(true)
        try {
            if (files) {
                const response = await uploadFile(files)
                if (response?.status) {
                    const { aiResponse, aiBiomarkerResponse } = response?.updateFile
                    const mergedResponse = mergeAiResponses(aiResponse, aiBiomarkerResponse)
                    setAiResponse(mergedResponse);
                    setSummary(response?.updateFile?.summary);
                    setUserDetails(response?.updateFile?.userDetails)
                    setResponseId(response?.id);
                } else {
                    setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
                }
            }
        } catch (error) {
            console.error("error while uploading file", error);
            setNotificationBadge({ showNotification: true, isSuccess: false, message: "Something went wrong !!" });

        }
        setLoader(false)
    };

    return (
        <>
            <Header />
            {loader && <Loader />}
            {notificationBadge?.showNotification && <NotificationBadge notificationBadge={notificationBadge} setNotificationBadge={setNotificationBadge} />}
            {!loader && (aiResponse?.length > 0 || summary) ?
                <div style={{ display: "flex", alignItems: "flex-start", marginTop: "100px", gap: "60px" }}>
                    <BiomarkerView data={aiResponse} summary={summary} userDetails={userDetails} />
                    <Feedback responseId={responseId} />
                </div>
                :
                <Box
                    display="flex"
                    justifyContent="space-around"
                    alignItems="center"
                    width="100%"
                    height="calc(100vh - 256px)"
                    textAlign="center"
                >

                    <div elevation={3} style={{ padding: '30px', borderRadius: '10px', background: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Report Analyzer
                        </Typography>

                        {uploadStatus != "locally_uploaded" ? <FileUploader
                            handleChange={handleChange}
                            name="file"
                            types={fileTypes}
                            children={
                                <UploadBox>
                                    <CloudUploadIcon style={{ fontSize: '48px', color: 'rgb(13,164,239)' }} />
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        style={{ marginTop: '10px', marginBottom: '10px' }}
                                    >
                                        Drag & drop files or{' '}
                                        <Typography
                                            component="span"
                                            style={{ color: 'rgb(13,164,239)', cursor: 'pointer' }}
                                        >
                                            Browse
                                        </Typography>
                                    </Typography>
                                    <Typography variant="body2" align="center" color="textSecondary">
                                        Supported formats: .XLS , .XLSX, .XLSM, .CSV
                                    </Typography>
                                </UploadBox>
                            }
                        /> :
                            <UploadBox>
                                <Typography
                                    variant="body1"
                                    align="center"
                                    style={{ marginTop: '10px', marginBottom: '10px' }}
                                >
                                    {fileName}
                                </Typography>
                            </UploadBox>

                        }
                        <UploadButton variant="contained" onClick={handleUpload}>
                            Upload
                        </UploadButton>
                    </div>
                </Box>
            }
        </>
    );
}