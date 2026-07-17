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

interface TestimonialPopupProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
}

const TestimonialPopup: React.FC<TestimonialPopupProps> = ({
    open,
    onClose,
    onSubmit,
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
        } catch (err) {
            console.error("Testimonial submission error:", err);
            setError("Failed to submit testimonial. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = (_event: {}, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick") return;
        if (onClose) onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                How was your experience with Barakah?
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <Typography variant="body2" color="textSecondary" align="center">
                        We would love to hear your thoughts about our platform.
                    </Typography>

                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={2}>
                        <Typography component="legend">Rate the Platform</Typography>
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
                        label="Share your testimonial"
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => {
                            setComment(e.target.value);
                            if (e.target.value.trim()) setError(null);
                        }}
                        variant="outlined"
                        fullWidth
                        placeholder="Tell us what you liked about Barakah..."
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} disabled={submitting} sx={{ color: 'text.secondary' }}>
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
                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Testimonial"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TestimonialPopup;
