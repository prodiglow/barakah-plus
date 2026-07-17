import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    Avatar,
    Rating,
    CircularProgress,
    Snackbar,
    Alert,
} from "@mui/material";
import { getAllReviews, approveReview, rejectReview, Review } from "../services/reviewService";

interface UserReviewsProps {
    onUpdate?: () => void;
    refreshTrigger?: number;
}

const UserReviews: React.FC<UserReviewsProps> = ({ onUpdate, refreshTrigger }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
        open: false,
        message: "",
        type: "success",
    });

    useEffect(() => {
        fetchReviews();
    }, [refreshTrigger]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getAllReviews();
            setReviews(data);
        } catch (err) {
            setError("Failed to load reviews");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveReview(id);
            setReviews((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: "approved" } : r))
            );
            setSnackbar({ open: true, message: "Review approved successfully", type: "success" });
            if (onUpdate) onUpdate(); // 🔄 Trigger update
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Failed to approve review", type: "error" });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await rejectReview(id);
            setReviews((prev) =>
                prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
            );
            setSnackbar({ open: true, message: "Review rejected successfully", type: "success" });
            if (onUpdate) onUpdate(); // 🔄 Trigger update
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Failed to reject review", type: "error" });
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                User Feedbacks
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell>Reviewer</TableCell>
                            <TableCell>Scholar</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No reviews found.</TableCell>
                            </TableRow>
                        ) : (
                            reviews.map((review) => (
                                <TableRow key={review._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            {/* Handle case where reviewer might be null if deleted */}
                                            <Avatar src={review.reviewer?.profilePic} alt={review.reviewer?.name || "Unknown"} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {review.reviewer?.name || "Unknown User"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {review.reviewer?.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            {/* Handle case where scholar might be null */}
                                            <Avatar src={review.scholar?.ProfileImg} sx={{ width: 30, height: 30 }} />
                                            <Typography variant="body2">{review.scholar?.scholarName || "Unknown Scholar"}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={review.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3,
                                        }}>
                                            {review.comment}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={review.status.toUpperCase()}
                                            color={
                                                review.status === "approved" ? "success" :
                                                    review.status === "rejected" ? "error" : "warning"
                                            }
                                            size="small"
                                            sx={{ fontWeight: "bold" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {(review.status === "pending" || review.status === "rejected") && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleApprove(review._id)}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {(review.status === "pending" || review.status === "approved") && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleReject(review._id)}
                                                >
                                                    Reject
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={snackbar.type}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default UserReviews;
