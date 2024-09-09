import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { marked } from 'marked';


const colors = {
    header: "#00c0ed",
    backgroundColor: "#00c0ed",
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
                    bgcolor={colors.background}
                    borderRadius={1}
                >
                    <Typography
                        variant="body1"
                        sx={{ color: colors.header, fontWeight: "bold" }}
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

export const BiomarkerView = ({ data, summary, userDetails }) => {
    const [summaryDetails, setSummaryDetails] = useState("");

    useEffect(() => {
        if (summary) {
            setSummaryDetails(summary);
        }
    }, [summary]);



    if ((!data || !data.length) && !summaryDetails) return <Typography>No data available</Typography>;

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            overflow="auto"
            maxWidth="1128px"
        >
            {/* User Details Table */}
            <Typography variant="h6" style={{ marginBottom: '10px', alignSelf: "self-start", color: "#11CCEF", fontWeight: 'bold' }} >
                User Info
            </Typography>
            <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', background: "white" }}>
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
            {summaryDetails &&
                <Paper elevation={3} sx={{ p: 2, mb: 2, width: '100%', }}>
                    <Typography variant="h6" sx={{ color: colors.header, fontWeight: 'bold', mb: 1 }}>
                        Summary:
                    </Typography>
                    <Typography variant="body2" component="div"
                        dangerouslySetInnerHTML={{ __html: marked(summaryDetails) }}
                    />
                </Paper>
            }


            {data?.length > 0 && data.map((biomarker, index) => (
                <Paper key={index} elevation={3} sx={{ p: 2, mb: 2, width: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {biomarker.name}
                    </Typography>
                    {renderKeyValuePairs(biomarker)}
                </Paper>
            ))}
        </Box>
    );
};
