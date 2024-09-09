import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Avatar,
  Skeleton,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { updateChatMessage } from "../../apis/upload.api";
import PersonIcon from "@mui/icons-material/Person";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";

const colors = {
  header: "#8C8CFF",
  background: "#F9F9F9",
  userMessage: "#8C8CFF",
  botMessage: "#EAEAEA",
};

const DemoGraphicQust = ({ demoGraphicQust, responseId, prevChatMessage }) => {
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const initialChatMessages = prevChatMessage
    ? prevChatMessage.map((msg) => ({
      ...msg,
      date: new Date(msg.date),
    }))
    : demoGraphicQust;
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const chatContainerRef = useRef(null);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const newMessage = {
        message: inputMessage,
        from: "user",
        date: new Date(),
      };

      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setLoading(true);

      const temp = {
        id: responseId,
        demoGraphicQuestions: [...chatMessages, newMessage],
      };

      console.log("Sending to API:", temp);
      const aiResponse = await updateChatMessage(temp);

      if (aiResponse?.status) {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          {
            message: aiResponse?.demoGraphicQuestion,
            from: "bot",
            date: new Date(),
          },
        ]);
      }
      setLoading(false);
      // Clear the input field
      setInputMessage("");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          width: "100%",
          // maxWidth: "800px",
          bgcolor: colors.background,
          borderRadius: "16px", // Rounded borders for the chat section
          wordBreak: "break-word"
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: colors.header, fontWeight: "bold", mb: 2 }}
        >
          AI Q&A:
        </Typography>
        {/* Chat Messages Container with Fixed Height */}
        <Box
          ref={chatContainerRef}
          sx={{
            height: "400px",
            overflowY: "auto",
            mb: 2,
            p: 1,
            borderRadius: "16px",
          }}
        >
          {chatMessages?.map((chat, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent:
                  chat.from === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              {chat.from === "bot" && (
                <Avatar sx={{ bgcolor: colors.botMessage, mr: 1 }}>
                  <AutoAwesomeIcon />
                </Avatar>
              )}
              <Paper
                elevation={2}
                sx={{
                  p: 1.5,
                  maxWidth: "75%",
                  wordBreak: "break-word",
                  bgcolor: chat.from === "user" ? colors.userMessage : "#fff",
                  color: chat.from === "user" ? "#fff" : "#000",
                  borderRadius: chat.from === "user" ? "1rem 1rem 1px 1rem" : "1rem 1rem 1rem 1px", // Rounded borders for chat bubbles
                }}
              >
                <Typography
                  sx={{
                    textAlign: "justify", // Justify text
                    textAlignLast: "left", // Align last line to the left
                    wordBreak: "break-word",
                  }}

                >{chat.message}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: chat.from === "user" ? "#fff" : "black", mt: 0.5 }}
                >
                  {/* {chat?.date?.toLocaleDateString()}{" "}
                  {chat?.date?.toLocaleTimeString()} */}
                </Typography>
              </Paper>
              {chat.from === "user" && (
                <Avatar sx={{ bgcolor: colors.userMessage, ml: 1 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mb: 1,
                alignItems: "center",
              }}
            >
              <Avatar sx={{ bgcolor: colors.botMessage, mr: 1 }}>
                <AutoAwesomeIcon />
              </Avatar>
              <Skeleton
                variant="rectangular"
                width="75%"
                height={40}
                sx={{ borderRadius: "12px" }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {!prevChatMessage?.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", cursor: loading ? "not-allowed" : "pointer" }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading} // Disable input when loading
              InputProps={{
                style: {
                  cursor: loading ? "not-allowed" : "text",
                },
              }}
              sx={{
                mr: 2,
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={loading} // Disable button when loading
              sx={{
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>

        )}
      </Paper>
    </>
  );
};

export default DemoGraphicQust;
