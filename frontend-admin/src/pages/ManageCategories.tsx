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
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Avatar,
    CircularProgress,
} from "@mui/material";
import { useAlertDialog } from "../contexts/AlertDialogContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../services/categoryService";
import { uploadToCloudinary } from "../services/CloudinaryService";
import { Category } from "../types/dua";

const ManageCategories: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const { showConfirm } = useAlertDialog();
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Category>({
        title: "",
        image: "",
        description: "",
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            toast.error("Failed to fetch Categories");
        }
    };

    const handleOpen = () => {
        setOpen(true);
        setIsEdit(false);
        setFormData({ title: "", image: "", description: "" });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleEdit = (category: Category) => {
        setOpen(true);
        setIsEdit(true);
        setCurrentId(category._id!);
        setFormData({
            title: category.title,
            image: category.image || "",
            description: category.description || "",
        });
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm("Delete Category", "Are you sure you want to delete this Category?");
        if (confirmed) {
            try {
                await deleteCategory(id);
                toast.success("Category deleted successfully");
                fetchCategories();
            } catch (error) {
                toast.error("Failed to delete Category");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit");
            return;
        }

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file, ""); // Token is handled by api interceptor
            setFormData({ ...formData, image: url });
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEdit && currentId) {
                await updateCategory(currentId, formData);
                toast.success("Category updated successfully");
            } else {
                await createCategory(formData);
                toast.success("Category created successfully");
            }
            handleClose();
            fetchCategories();
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Manage Du'as Categories
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                >
                    Add New Category
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                        <TableRow>
                            <TableCell>Image</TableCell>
                            <TableCell width="25%">Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category._id} hover>
                                <TableCell>
                                    <Avatar src={category.image} alt={category.title} variant="rounded" />
                                </TableCell>
                                <TableCell>{category.title}</TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleEdit(category)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(category._id!)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No Categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={open}
                onClose={(_, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose();
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{isEdit ? "Edit Category" : "Add New Category"}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>

                        {/* Image Upload - Centered and Circular */}
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="icon-button-file"
                                type="file"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="icon-button-file">
                                <Box position="relative" display="inline-flex">
                                    <Avatar
                                        src={formData.image || undefined}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            cursor: 'pointer',
                                            bgcolor: 'grey.200',
                                            border: '1px dashed grey'
                                        }}
                                    >
                                        {!formData.image && <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
                                    </Avatar>
                                    {uploading && (
                                        <CircularProgress
                                            size={100}
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                zIndex: 1,
                                            }}
                                        />
                                    )}
                                </Box>
                            </label>
                            <Typography variant="caption" color="text.secondary">
                                {formData.image ? "Click image to change" : "Upload Image (Max 5MB)"}
                            </Typography>
                        </Box>

                        <TextField
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: "#04AA6D" }}>
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageCategories;
