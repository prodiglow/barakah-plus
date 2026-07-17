import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Rating,
    TextField,
    Typography,
    Box,
    CircularProgress,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FeedbackPopupProps {
    open: boolean;
    onClose: () => void;
    onDismiss?: () => void; // New prop for explicit dismissal (max out count)
    onSubmit: (rating: number, comment: string) => Promise<void>;
    order: any; // Using any for flexibility with populated fields, or update Order type
}


const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
    open,
    onClose,
    onDismiss,
    onSubmit,
    order,
}) => {
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!rating && !comment.trim()) {
            setError("Please provide a star rating or a comment.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await onSubmit(rating || 0, comment.trim());
            // Reset form handled by parent closing/unmounting or separate effect
        } catch (err) {
            console.error("Feedback submission error:", err);
            setError("Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = (_event: {}, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick") return;
        if (onClose) onClose();
    };

    if (!order) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                How was your experience?
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <Typography variant="body2" color="textSecondary" align="center">
                        Order #{order.OrderID} - {order.OrderTitle}
                    </Typography>
                    {order.scholarName && (
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#F69320" }} align="center">
                            Scholar: {order.scholarName}
                        </Typography>
                    )}

                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={2}>
                        <Typography component="legend">Rate the Scholar service</Typography>
                        <Rating
                            name="simple-controlled"
                            value={rating}
                            onChange={(_, newValue) => {
                                setRating(newValue);
                                if (newValue) setError(null);
                            }}
                            size="large"
                        />
                    </Box>

                    <TextField
                        label="Share your feedback"
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value);
                            if (e.target.value.trim()) setError(null);
                        }}
                        variant="outlined"
                        fullWidth
                        placeholder="Tell us about your experience..."
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onDismiss || onClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
                    Maybe Later
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                    sx={{
                        backgroundColor: "#F69320",
                        color: "white",
                        "&:hover": { backgroundColor: "#e0841b" },
                    }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Feedback"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FeedbackPopup;
