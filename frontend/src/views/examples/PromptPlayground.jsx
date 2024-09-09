import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { promptUpdation, retrievePrompt } from '../../apis/prompt.api';
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
} from "reactstrap";
import Header from "components/Headers/Header.js";

const PromptPlayground = () => {
    const [text, setText] = useState('');
    const [selectedKey, setSelectedKey] = useState('summary');
    const [promptData, setPromptData] = useState({});
    const [notificationBadge, setNotificationBadge] = useState({
        showNotification: false,
        isSuccess: null,
        message: ""
    });
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        retrievePromptData();
    }, []);

    useEffect(() => {
        // Update the text when the selected key changes
        if (selectedKey && promptData[selectedKey]) {
            setText(promptData[selectedKey]);
        }
    }, [selectedKey, promptData]);

    const retrievePromptData = async () => {
        const response = await retrievePrompt();
        if (response?.status) {
            setPromptData(response?.prompt);
            setText(response?.prompt?.[selectedKey]); // Initially set the text to the default key's value
        } else {
            setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
        }
    };

    const updatePrompt = async () => {
        try {
            setLoader(true);
            const data = { [selectedKey]: text };
            const response = await promptUpdation(data);
            if (response?.status) {
                setNotificationBadge({ showNotification: true, isSuccess: true, message: response?.message });
            } else {
                setNotificationBadge({ showNotification: true, isSuccess: false, message: response?.message });
            }
            setLoader(false);

        } catch (error) {
            console.log("error while updating prompt", error);
            setNotificationBadge({ showNotification: true, isSuccess: false, message: "Something went wrong !!" });
            setLoader(false);
        }
    };

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row>
                    <Col className="mb-5 mb-xl-0" xl="12">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent">
                                <Row className="align-items-center">
                                    <div className="col">
                                        <h2 className="mb-0"> Prompt Updater</h2>
                                    </div>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {/* Box Component for Prompt Updater */}
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select</InputLabel>
                                    <Select
                                        value={selectedKey}
                                        onChange={(e) => setSelectedKey(e.target.value)}
                                        label="Select Key"
                                    >
                                        {Object.keys(promptData).map((key) => (
                                            <MenuItem key={key} value={key}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    multiline
                                    rows={20}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        backgroundColor: '#FFFFFF',
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                    <Button
                                        variant="contained"
                                        onClick={updatePrompt}
                                        sx={{ backgroundColor: '#00bbec', color: '#FFFFFF', textTransform: "capitalize" }}
                                        disabled={loader}
                                    >
                                        {loader ? (
                                            <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
                                        ) : (
                                            'Update Prompt'
                                        )}
                                    </Button>
                                </Box>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default PromptPlayground;
