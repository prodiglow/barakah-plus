import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    CardMedia,
    Chip,
    Switch,
} from "@mui/material";
import { useAlertDialog } from "../contexts/AlertDialogContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import {
    getAllBlogs,
    deleteBlog,
    toggleFeatured,
    togglePublished,
    BlogData,
} from "../services/blogService";
import BlogFormDialog from "../components/BlogFormDialog";

const ManageBlogs: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const { showConfirm } = useAlertDialog();
    const [blogs, setBlogs] = useState<BlogData[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [selectedBlog, setSelectedBlog] = useState<Partial<BlogData> | undefined>(undefined);

    useEffect(() => {
        fetchBlogs();
    }, [refreshTrigger]);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const data = await getAllBlogs();
            const blogList = Array.isArray(data.blogs) ? data.blogs : Array.isArray(data) ? data : [];
            setBlogs(blogList);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        setIsEdit(false);
        setCurrentId(null);
        setSelectedBlog(undefined);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentId(null);
        setIsEdit(false);
        setSelectedBlog(undefined);
    };

    const handleEdit = (blog: BlogData) => {
        setOpen(true);
        setIsEdit(true);
        setCurrentId(blog._id || null);
        setSelectedBlog(blog);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm("Delete Blog", "Are you sure you want to delete this blog post?");
        if (confirmed) {
            try {
                await deleteBlog(id);
                toast.success("Blog deleted successfully");
                fetchBlogs();
            } catch (error) {
                toast.error("Failed to delete blog");
            }
        }
    };

    const handleToggleFeatured = async (id: string) => {
        try {
            await toggleFeatured(id);
            toast.success("Featured status updated");
            fetchBlogs();
        } catch (error) {
            toast.error("Failed to update featured status");
        }
    };

    const handleTogglePublished = async (id: string) => {
        try {
            await togglePublished(id);
            toast.success("Published status updated");
            fetchBlogs();
        } catch (error) {
            toast.error("Failed to update published status");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Strip HTML tags for preview
    const stripHtml = (html: string) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Manage Blogs
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                >
                    Add New Blog
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                            <TableRow>
                                <TableCell>Cover</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Author</TableCell>
                                <TableCell>Excerpt</TableCell>
                                <TableCell>Tags</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {blogs.map((blog) => (
                                <TableRow key={blog._id} hover>
                                    <TableCell>
                                        {blog.coverImage ? (
                                            <CardMedia
                                                component="img"
                                                sx={{ width: 60, height: 45, borderRadius: 1, objectFit: "cover" }}
                                                image={blog.coverImage}
                                                alt={blog.title}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 45,
                                                    borderRadius: 1,
                                                    backgroundColor: "#e0e0e0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    color: "#888",
                                                }}
                                            >
                                                No Image
                                            </Box>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: "bold", maxWidth: 200 }}>
                                        {blog.title}
                                    </TableCell>
                                    <TableCell>{blog.author}</TableCell>
                                    <TableCell
                                        sx={{
                                            maxWidth: 200,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {blog.excerpt || stripHtml(blog.content).substring(0, 80) + "..."}
                                    </TableCell>
                                    <TableCell>
                                        {blog.tags?.map((tag, idx) => (
                                            <Chip
                                                key={idx}
                                                label={tag}
                                                size="small"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                variant="outlined"
                                            />
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={blog.isFeatured}
                                            onChange={() => handleToggleFeatured(blog._id!)}
                                            color="warning"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={blog.isPublished ? "Published" : "Draft"}
                                            size="small"
                                            color={blog.isPublished ? "success" : "default"}
                                            onClick={() => handleTogglePublished(blog._id!)}
                                            sx={{ cursor: "pointer" }}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(blog.createdAt)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(blog);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(blog._id!);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {blogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                        No blogs found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <BlogFormDialog
                open={open}
                onClose={handleClose}
                initialData={selectedBlog}
                onSuccess={fetchBlogs}
                isEdit={isEdit}
                currentId={currentId}
            />
        </Box>
    );
};

export default ManageBlogs;
