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
import { getAllPlatformTestimonials, updatePlatformTestimonialStatus, PlatformTestimonial } from "../services/platformTestimonialService";

interface UserTestimonialsProps {
    onUpdate?: () => void;
    refreshTrigger?: number;
}

const UserTestimonials: React.FC<UserTestimonialsProps> = ({ onUpdate, refreshTrigger }) => {
    const [testimonials, setTestimonials] = useState<PlatformTestimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
        open: false,
        message: "",
        type: "success",
    });

    useEffect(() => {
        fetchTestimonials();
    }, [refreshTrigger]);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const data = await getAllPlatformTestimonials();

            if (Array.isArray(data)) {
                setTestimonials(data);
            } else {
                console.error("Testimonials data is not an array:", data);
                setTestimonials([]);
            }
        } catch (err) {
            setError("Failed to load testimonials");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updatePlatformTestimonialStatus(id, status);
            setTestimonials((prev) =>
                prev.map((t) => (t._id === id ? { ...t, status } : t))
            );
            setSnackbar({ open: true, message: `Testimonial ${status} successfully`, type: "success" });
            if (onUpdate) onUpdate(); // 🔄 Trigger update
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: `Failed to ${status} testimonial`, type: "error" });
        }
    };

    if (loading) return <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                Platform Testimonials
            </Typography>

            <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Rating</TableCell>
                            <TableCell>Comment</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!Array.isArray(testimonials) || testimonials.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No testimonials found.</TableCell>
                            </TableRow>
                        ) : (
                            testimonials.map((testimonial) => (
                                <TableRow key={testimonial._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar src={testimonial.user?.profilePic} alt={testimonial.user?.name || "Unknown"} />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {testimonial.user?.name || "Unknown User"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {testimonial.user?.email}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={testimonial.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" sx={{
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 3,
                                        }}>
                                            {testimonial.comment}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(testimonial.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={testimonial.status.toUpperCase()}
                                            color={
                                                testimonial.status === "approved" ? "success" :
                                                    testimonial.status === "rejected" ? "error" : "warning"
                                            }
                                            size="small"
                                            sx={{ fontWeight: "bold" }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            {(testimonial.status === "pending" || testimonial.status === "rejected") && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleUpdateStatus(testimonial._id, "approved")}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {(testimonial.status === "pending" || testimonial.status === "approved") && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleUpdateStatus(testimonial._id, "rejected")}
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

export default UserTestimonials;
