import React, { useState } from "react";
import { Box, Typography, TextField, Rating, Button, Paper,Divider } from "@mui/material";
import { updateChatMessage } from '../../apis/upload.api';
import { NotificationBadge } from 'components/NotificationBadge/NotificationBadge';

const Feedback = ({responseId}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false)
  const [notificationBadge, setNotificationBadge] = useState({
      showNotification: false,
      isSuccess: null,
      message: ""
  })

  const validateForm = () => {
    const newErrors = {};
    if (rating === 0) {
      newErrors.rating = "Please provide a rating.";
    }
    if (!feedback.trim()) {
      newErrors.message = "Message cannot be empty.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async() => {
    if (validateForm()) {
      // Handle form submission logic here
      console.log("Form submitted:", { rating, feedback });
      const response = await updateChatMessage({id:responseId, rating:rating, feedback:feedback })
      if(response?.status){
          // Reset the form
          //   setRating(0);
          //   setFeedback("");
          //   setErrors({});
        }
        setNotificationBadge({ showNotification: true, isSuccess: response?.status, message: response?.message });
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 2, maxWidth: 350}}>
    {notificationBadge?.showNotification && <NotificationBadge notificationBadge={notificationBadge} setNotificationBadge={setNotificationBadge} />}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{color:"#00c0ed",margin:0}}>
          Feedback
        </Typography>
        <Divider sx={{width: "38%", margin: "5px auto",borderWidth:"2px" }} />
        <Typography variant="subtitle1" gutterBottom>
          Rate Analysis
        </Typography>
        <Rating
          name="rate-analysis"
          value={rating}
          onChange={(event, newValue) => setRating(newValue)}
          size="large"
        />
        {errors.rating && (
            <Typography variant="caption" color="error" sx={{ display: "block"}}>
            {errors.rating}
          </Typography>
        )}
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Write your message
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          placeholder="Your message"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          sx={{ marginTop: 2 }}
          error={!!errors.message}
          helperText={errors.message}
        />
        <Button
          variant="contained"
          color="primary"
          
          sx={{ marginTop: 2,background:"#00c0ed",textTransform:"capitalize" }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Paper>
  );
};

export default Feedback;
