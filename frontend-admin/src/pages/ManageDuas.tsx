import React, { useEffect, useState, useRef } from "react";
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
    Switch,
    Chip,
    FormControlLabel,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import { useAlertDialog } from "../contexts/AlertDialogContext";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import {
    getAllDuas,
    createDua,
    updateDua,
    deleteDua,
    toggleDuaStatus,
} from "../services/duaService";
import { getAllCategories } from "../services/categoryService";
import { uploadAudioToCloudinary } from "../services/CloudinaryService";
import { Dua, CreateDuaPayload, Category } from "../types/dua";

const initialFormState: CreateDuaPayload = {
    title: "",
    arabic_text: "",
    transliteration: "",
    translation: "",
    reference: "",
    virtue: "",
    explanation: "",
    audioUrl: "",
    category: [],
    language: "Arabic / English",
    repeat: 1,
    is_active: true,
};

const getSupportedMimeType = () => {
    const types = [
        "audio/webm",
        "audio/mp4",
        "audio/ogg",
        "audio/wav"
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return "";
};

const ManageDuas: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const { showConfirm } = useAlertDialog();
    const [duas, setDuas] = useState<Dua[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateDuaPayload>(initialFormState);
    const [submitting, setSubmitting] = useState(false);

    // Audio State
    const [recording, setRecording] = useState(false);
    const [audioContent, setAudioContent] = useState<File | Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const MAX_RECORDING_SECONDS = 120; // 2 minutes

    useEffect(() => {
        fetchDuas();
        fetchCategories();
    }, [refreshTrigger]);

    const fetchDuas = async () => {
        try {
            const data = await getAllDuas();
            setDuas(data);
        } catch (error) {
            toast.error("Failed to fetch Duas");
        }
    };

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
        setFormData(initialFormState);
        resetAudio();
    };

    const handleClose = () => {
        setOpen(false);
        resetAudio();
    };

    const resetAudio = () => {
        setRecording(false);
        setAudioContent(null);
        setPreviewUrl(null);
        audioChunks.current = [];
    };

    const handleEdit = (dua: Dua) => {
        setOpen(true);
        setIsEdit(true);
        setCurrentId(dua._id);
        setFormData({
            title: dua.title,
            arabic_text: dua.arabic_text,
            transliteration: dua.transliteration || "",
            translation: dua.translation,
            reference: dua.reference || "",
            virtue: dua.virtue || "",
            explanation: dua.explanation || "",
            audioUrl: dua.audioUrl || "",
            category: dua.category.map((c) => c._id!),
            language: dua.language,
            repeat: dua.repeat || 1,
            is_active: dua.is_active,
        });
        setPreviewUrl(dua.audioUrl || null);
        setAudioContent(null);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm("Delete Dua", "Are you sure you want to delete this Dua?");
        if (confirmed) {
            try {
                await deleteDua(id);
                toast.success("Dua deleted successfully");
                fetchDuas();
            } catch (error) {
                toast.error("Failed to delete Dua");
            }
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleDuaStatus(id);
            fetchDuas();
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Audio Logic ---

    // Auto-stop recording at 2 minutes
    useEffect(() => {
        if (recording) {
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev + 1 >= MAX_RECORDING_SECONDS) {
                        // Auto-stop at 2 minutes
                        mediaRecorderRef.current?.stop();
                        setRecording(false);
                        return MAX_RECORDING_SECONDS;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }
        }
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [recording]);

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRecordClick = async () => {
        if (!recording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mimeType = getSupportedMimeType();

                if (!mimeType) {
                    toast.error("Audio recording is not supported in this browser.");
                    return;
                }

                const mediaRecorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = mediaRecorder;
                audioChunks.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunks.current.push(e.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(audioChunks.current, { type: mimeType });
                    setAudioContent(blob);
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    // Clear previous audioUrl in formData if any
                    setFormData(prev => ({ ...prev, audioUrl: "" }));
                };

                // Use small timeslice for safety
                mediaRecorder.start(1000);
                setRecording(true);
            } catch (err) {
                console.error("Recording error:", err);
                toast.error("Please allow microphone access!");
            }
        } else {
            mediaRecorderRef.current?.stop();
            setRecording(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAudioContent(file);
            setPreviewUrl(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, audioUrl: "" }));
        }
    };

    const handleRemoveAudio = () => {
        setAudioContent(null);
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, audioUrl: "" }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            let finalAudioUrl = formData.audioUrl;
            let contentToUpload = audioContent;

            // Auto-stop recording if active
            if (recording && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                try {
                    await new Promise<void>((resolve) => {
                        mediaRecorderRef.current!.addEventListener("stop", () => {
                            setRecording(false);
                            resolve();
                        }, { once: true });
                        mediaRecorderRef.current!.stop();
                    });

                    // Construct blob manually as state won't update in this scope
                    if (audioChunks.current.length > 0) {
                        const mimeType = getSupportedMimeType();
                        contentToUpload = new Blob(audioChunks.current, { type: mimeType });
                    }
                } catch (e) {
                    console.error("Error stopping recording:", e);
                }
            }

            // Upload audio if there's new content
            if (contentToUpload) {
                try {
                    let fileToUpload: File;
                    if (contentToUpload instanceof Blob && !(contentToUpload instanceof File)) {
                        // Infer extension from mime type
                        const extension = contentToUpload.type.split("/")[1]?.split(";")[0] || "webm";
                        fileToUpload = new File([contentToUpload], `audio.${extension}`, { type: contentToUpload.type });
                    } else {
                        fileToUpload = contentToUpload as File;
                    }

                    const token = localStorage.getItem("token") || "";
                    const uploadRes = await uploadAudioToCloudinary(fileToUpload, token);
                    finalAudioUrl = uploadRes.url;
                } catch (error) {
                    console.error("Audio upload failed", error);
                    toast.error("Failed to upload audio. Please try again.");
                    setSubmitting(false);
                    return;
                }
            }

            const payload = { ...formData, audioUrl: finalAudioUrl };

            if (isEdit && currentId) {
                await updateDua(currentId, payload);
                toast.success("Dua updated successfully");
            } else {
                await createDua(payload);
                toast.success("Dua created successfully");
            }
            handleClose();
            fetchDuas();
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Manage Du'as
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                >
                    Add New Dua
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                        <TableRow>
                            <TableCell width="15%">Title</TableCell>
                            <TableCell width="30%">Arabic Text</TableCell>
                            <TableCell>Categories</TableCell>
                            <TableCell>Language</TableCell>
                            <TableCell>Repeat</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {duas.map((dua) => (
                            <TableRow key={dua._id} hover>
                                <TableCell>{dua.title}</TableCell>
                                <TableCell sx={{ direction: "rtl", fontFamily: "Traditional Arabic, serif", fontSize: "1.2rem" }}>
                                    {dua.arabic_text.substring(0, 50)}...
                                </TableCell>
                                <TableCell>
                                    {dua.category.map((cat, idx) => (
                                        <Chip key={idx} label={cat.title} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                    ))}
                                </TableCell>
                                <TableCell>{dua.language}</TableCell>
                                <TableCell>{dua.repeat || 1}x</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={dua.is_active}
                                        onChange={() => handleToggleStatus(dua._id)}
                                        color="success"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleEdit(dua)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(dua._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {duas.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No Duas found. Add one to get started.
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
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>{isEdit ? "Edit Dua" : "Add New Dua"}</DialogTitle>
                <DialogContent dividers>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Arabic Text"
                            name="arabic_text"
                            value={formData.arabic_text}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            required
                            dir="rtl"
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Repeat Count"
                                name="repeat"
                                type="number"
                                value={formData.repeat || 1}
                                onChange={(e) => setFormData({ ...formData, repeat: Number(e.target.value) })}
                                sx={{ width: '150px' }}
                                inputProps={{ min: 1 }}
                            />
                        </Box>
                        <TextField
                            label="Transliteration"
                            name="transliteration"
                            value={formData.transliteration}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Translation"
                            name="translation"
                            value={formData.translation}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            label="Reference"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Virtue"
                            name="virtue"
                            value={formData.virtue}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Explanation"
                            name="explanation"
                            value={formData.explanation}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                        />

                        {/* Audio Section */}
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Audio
                            </Typography>

                            {!previewUrl ? (
                                <Box display="flex" gap={2} alignItems="center">
                                    <Button
                                        variant={recording ? "contained" : "outlined"}
                                        color={recording ? "error" : "primary"}
                                        startIcon={recording ? <StopIcon /> : <MicIcon />}
                                        onClick={handleRecordClick}
                                    >
                                        {recording ? `Stop Recording (${formatRecordingTime(recordingTime)} / 02:00)` : "Record Audio"}
                                    </Button>
                                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                        ⏱ Only 2 minutes of voice recording is allowed.
                                    </Typography>

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        disabled={recording}
                                    >
                                        Upload File
                                        <input
                                            type="file"
                                            hidden
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                        />
                                    </Button>
                                </Box>
                            ) : (
                                <Box display="flex" alignItems="center" gap={2} bgcolor="#f5f5f5" p={1} borderRadius={1}>
                                    <audio controls src={previewUrl} style={{ width: "100%" }} />
                                    <IconButton color="error" onClick={handleRemoveAudio}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            )}
                            <Typography variant="caption" color="text.secondary" mt={1} display="block">
                                {audioContent ? "Audio ready to upload on save." : (formData.audioUrl ? "Using existing audio." : "No audio selected.")}
                            </Typography>
                        </Box>

                        <Autocomplete
                            multiple
                            options={categories}
                            getOptionLabel={(option) => option.title}
                            value={categories.filter((c) => formData.category.includes(c._id!))}
                            onChange={(_, newValue) => {
                                setFormData({ ...formData, category: newValue.map((c) => c._id!) });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Categories"
                                    placeholder="Select Categories"
                                    required={formData.category.length === 0}
                                />
                            )}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Language</InputLabel>
                            <Select
                                value={formData.language}
                                label="Language"
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            >
                                <MenuItem value="Arabic / English">Arabic / English</MenuItem>
                                <MenuItem value="Arabic Only">Arabic Only</MenuItem>
                                <MenuItem value="English Only">English Only</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    color="success"
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{ backgroundColor: "#04AA6D" }}
                        disabled={submitting}
                        startIcon={submitting && <CircularProgress size={20} color="inherit" />}
                    >
                        {isEdit ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManageDuas;
