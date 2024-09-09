import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loader = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const messages = [
        "Analyzing your report...",
        "Generating summary...",
        "Finalizing suggestions...",
        "This may take a moment.",
    ];

    useEffect(() => {
        if (messageIndex < messages.length - 1) {
            const interval = setInterval(() => {
                setMessageIndex((prevIndex) => prevIndex + 1);
            }, 5000);

            return () => clearInterval(interval); // Clean up the interval on unmount
        }
    }, [messageIndex]);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                bgcolor: '#00c0ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                <Typography variant="h6" color="white">
                    {messages[messageIndex]}
                </Typography>
            </Box>
        </Box>
    );
};

export default Loader;
