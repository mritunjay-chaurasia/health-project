import React from "react";
import { Alert, Portal, Snackbar } from "@mui/material";

export const NotificationBadge = ({ notificationBadge, setNotificationBadge }) => (
    <Portal>
        <Snackbar
            open={notificationBadge?.showNotification}
            autoHideDuration={6000}
            onClose={() => setNotificationBadge((prev) => ({ ...prev, showNotification: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
            <Alert
                onClose={() => setNotificationBadge((prev) => ({ ...prev, showNotification: false }))}
                severity={notificationBadge?.isSuccess ? "success" : "error"}
                sx={{ width: '100%' }}
            >
                {notificationBadge?.message}
            </Alert>
        </Snackbar>
    </Portal>
);
