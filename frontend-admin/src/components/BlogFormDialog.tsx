import React, { useState, useRef, useMemo } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Switch,
    FormControlLabel,
    IconButton,
    Typography,
    Chip,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createBlog, updateBlog, BlogData } from "../services/blogService";
import { uploadToCloudinary } from "../services/CloudinaryService";

interface BlogFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<BlogData>;
    onSuccess: () => void;
    isEdit: boolean;
    currentId: string | null;
}

const BlogFormDialog: React.FC<BlogFormDialogProps> = ({
    open,
    onClose,
    initialData,
    onSuccess,
    isEdit,
    currentId,
}) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [author, setAuthor] = useState(initialData?.author || "Admin");
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
    const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const quillRef = useRef<any>(null);

    // Reset form when dialog opens with new data
    React.useEffect(() => {
        if (open) {
            setTitle(initialData?.title || "");
            setContent(initialData?.content || "");
            setExcerpt(initialData?.excerpt || "");
            setAuthor(initialData?.author || "Admin");
            setCoverImage(initialData?.coverImage || "");
            setImages(initialData?.images || []);
            setTags(initialData?.tags || []);
            setIsFeatured(initialData?.isFeatured || false);
            setIsPublished(initialData?.isPublished || false);
        }
    }, [open, initialData]);

    // Handle cover image upload
    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingCover(true);
            const token = localStorage.getItem("adminToken") || "";
            const url = await uploadToCloudinary(file, token);
            setCoverImage(url);
            toast.success("Cover image uploaded!");
        } catch (error) {
            console.error("Cover image upload failed:", error);
            toast.error("Failed to upload cover image");
        } finally {
            setUploadingCover(false);
        }
    };

    // Handle additional images upload
    const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploadingImages(true);
            const token = localStorage.getItem("adminToken") || "";
            const uploadPromises = Array.from(files).map((file) =>
                uploadToCloudinary(file, token)
            );
            const urls = await Promise.all(uploadPromises);
            setImages((prev) => [...prev, ...urls]);
            toast.success(`${urls.length} image(s) uploaded!`);
        } catch (error) {
            console.error("Image upload failed:", error);
            toast.error("Failed to upload images");
        } finally {
            setUploadingImages(false);
        }
    };

    // Remove an additional image
    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Quill image handler - upload to Cloudinary and insert
    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const token = localStorage.getItem("adminToken") || "";
                const url = await uploadToCloudinary(file, token);
                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", url);
                    quill.setSelection(range.index + 1);
                }
                toast.success("Image inserted into content!");
            } catch (error) {
                console.error("Inline image upload failed:", error);
                toast.error("Failed to upload image");
            }
        };
    };

    // Quill modules configuration
    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    [{ align: [] }],
                    ["link", "image"],
                    [{ color: [] }, { background: [] }],
                    ["clean"],
                ],
                handlers: {
                    image: imageHandler,
                },
            },
        }),
        []
    );

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "blockquote",
        "code-block",
        "align",
        "link",
        "image",
        "color",
        "background",
    ];

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!content.trim() || content === "<p><br></p>") {
            toast.error("Content is required");
            return;
        }

        try {
            setSubmitting(true);

            const payload: Partial<BlogData> = {
                title,
                content,
                excerpt,
                author,
                coverImage,
                images,
                tags,
                isFeatured,
                isPublished,
            };

            if (isEdit && currentId) {
                await updateBlog(currentId, payload);
                toast.success("Blog updated successfully!");
            } else {
                await createBlog(payload);
                toast.success("Blog created successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Blog save failed:", error);
            toast.error(error?.response?.data?.message || "Failed to save blog");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason !== "backdropClick") {
                    onClose();
                }
            }}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { minHeight: "80vh" } }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {isEdit ? "Edit Blog" : "Create New Blog"}
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
                    {/* Title */}
                    <TextField
                        label="Blog Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                        placeholder="Enter blog title..."
                    />

                    {/* Author */}
                    <TextField
                        label="Author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        fullWidth
                        placeholder="Author name"
                    />

                    {/* Excerpt */}
                    <TextField
                        label="Excerpt / Summary"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Short preview text for the blog..."
                    />

                    {/* Cover Image */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Cover Image
                        </Typography>
                        {coverImage ? (
                            <Box sx={{ position: "relative", display: "inline-block" }}>
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: 200,
                                        borderRadius: 8,
                                        objectFit: "cover",
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setCoverImage("")}
                                    sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        backgroundColor: "rgba(255,255,255,0.9)",
                                        "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                                    }}
                                >
                                    <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                            </Box>
                        ) : (
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={uploadingCover ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                                disabled={uploadingCover}
                            >
                                {uploadingCover ? "Uploading..." : "Upload Cover Image"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleCoverImageUpload}
                                />
                            </Button>
                        )}
                    </Box>

                    {/* Rich Text Editor */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Blog Content *
                        </Typography>
                        <Box sx={{
                            "& .ql-container": { minHeight: "300px", fontSize: "16px" },
                            "& .ql-editor": { minHeight: "300px" },
                            "& .ql-toolbar": { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
                            "& .ql-container.ql-snow": { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
                        }}>
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                placeholder="Write your blog content here..."
                            />
                        </Box>
                    </Box>

                    {/* Additional Images */}
                    <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Additional Images
                        </Typography>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={uploadingImages ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                            disabled={uploadingImages}
                            sx={{ mb: 2 }}
                        >
                            {uploadingImages ? "Uploading..." : "Upload Images"}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalImagesUpload}
                            />
                        </Button>
                        {images.length > 0 && (
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {images.map((img, index) => (
                                    <Box
                                        key={index}
                                        sx={{ position: "relative", display: "inline-block" }}
                                    >
                                        <img
                                            src={img}
                                            alt={`Blog image ${index + 1}`}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveImage(index)}
                                            sx={{
                                                position: "absolute",
                                                top: -6,
                                                right: -6,
                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                                                p: 0.3,
                                            }}
                                        >
                                            <CloseIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Tags */}
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        onChange={(_event, newValue) => {
                            setTags(newValue as string[]);
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    key={index}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Tags"
                                placeholder="Type a tag and press Enter..."
                                helperText="Press Enter after each tag"
                            />
                        )}
                    />

                    {/* Toggles */}
                    <Box display="flex" gap={4}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    color="warning"
                                />
                            }
                            label="Featured Blog"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    color="success"
                                />
                            }
                            label="Published"
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : undefined}
                    sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                >
                    {isEdit ? "Update Blog" : "Create Blog"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BlogFormDialog;
