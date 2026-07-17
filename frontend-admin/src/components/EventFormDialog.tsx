import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import api from "../services/api";
import {
    createEvent,
    updateEvent,
    getEventById,
    EventData,
} from "../services/eventService";

const DEFAULT_EVENT_PIC = "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg";

const initialFormState: EventData = {
    eventTitle: "",
    eventSpecial: "",
    description: "",
    eventLocation: "",
    eventDate: "",
    eventPic: DEFAULT_EVENT_PIC,
    joiningLink: "",
    isFeatured: false,
    showOnHomePage: false,
    quranKhawaniDate: "",
    quranKhawaniTimeSlot: "",
    orderId: "",
};

interface EventFormDialogProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<EventData>;
    onSuccess: () => void;
    isEdit?: boolean;
    currentId?: string | null;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
    open,
    onClose,
    initialData,
    onSuccess,
    isEdit = false,
    currentId = null,
}) => {
    const [formData, setFormData] = useState<EventData>(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    // Safari-safe date formatting helpers
    // Safari cannot parse some date formats via new Date(), so we use string manipulation
    const safeDateTimeFormat = (dateStr: string | Date | undefined | null): string => {
        if (!dateStr) return "";
        try {
            // If it's already a string in YYYY-MM-DDTHH:mm format, just return it
            const str = typeof dateStr === "string" ? dateStr : dateStr.toISOString?.() || String(dateStr);
            // Replace space with T for Safari compatibility, then try parsing
            const normalized = str.replace(" ", "T");
            const d = new Date(normalized);
            if (isNaN(d.getTime())) return str.slice(0, 16); // fallback: raw slice
            return d.toISOString().slice(0, 16);
        } catch {
            return "";
        }
    };

    const safeDateFormat = (dateStr: string | Date | undefined | null): string => {
        if (!dateStr) return "";
        try {
            const str = typeof dateStr === "string" ? dateStr : dateStr.toISOString?.() || String(dateStr);
            // If already in YYYY-MM-DD format, return as-is
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
            // Handle ISO strings (split by T)
            const split = str.split("T")[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(split)) return split;

            const normalized = str.replace(" ", "T");
            const d = new Date(normalized);
            if (isNaN(d.getTime())) return split;
            return d.toISOString().split("T")[0];
        } catch {
            return "";
        }
    };

    // Reset or prefill form when dialog opens
    useEffect(() => {
        const fetchEventDetails = async () => {
            if (open && isEdit && currentId) {
                try {
                    setLoadingData(true);
                    const data = await getEventById(currentId);
                    // Handle response structure (it's often { event: ... } or just ...)
                    const eventData = (data as any).event || data;

                    setFormData({
                        eventTitle: eventData.eventTitle || "",
                        eventSpecial: eventData.eventSpecial || "",
                        description: eventData.description || "",
                        eventLocation: eventData.eventLocation || "",
                        eventDate: safeDateTimeFormat(eventData.eventDate),
                        eventPic: eventData.eventPic || DEFAULT_EVENT_PIC,
                        joiningLink: eventData.joiningLink || "",
                        isFeatured: eventData.isFeatured === true,
                        showOnHomePage: eventData.showOnHomePage === true,
                        quranKhawaniDate: safeDateFormat(eventData.quranKhawaniDate),
                        quranKhawaniTimeSlot: eventData.quranKhawaniTimeSlot || "",
                        orderId: (eventData as any).orderId || "",
                    });
                } catch (error) {
                    console.error("Failed to fetch event details:", error);
                    toast.error("Failed to load event details");
                } finally {
                    setLoadingData(false);
                }
            } else if (open && initialData) {
                // Creating new with prefilled data or manual edit initial data
                setFormData({
                    eventTitle: initialData.eventTitle || "",
                    eventSpecial: initialData.eventSpecial || "",
                    description: initialData.description || "",
                    eventLocation: initialData.eventLocation || "",
                    eventDate: safeDateTimeFormat(initialData.eventDate),
                    eventPic: initialData.eventPic || DEFAULT_EVENT_PIC,
                    joiningLink: initialData.joiningLink || "",
                    isFeatured: initialData.isFeatured === true,
                    showOnHomePage: initialData.showOnHomePage === true,
                    quranKhawaniDate: safeDateFormat(initialData.quranKhawaniDate),
                    quranKhawaniTimeSlot: initialData.quranKhawaniTimeSlot || "",
                    orderId: (initialData as any).orderId || "",
                });
            } else if (open) {
                setFormData(initialFormState);
            }
        };

        fetchEventDetails();
    }, [open, isEdit, currentId, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append("image", file);

        try {
            setIsUploading(true);
            const response = await api.post("/upload", formDataUpload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data && response.data.url) {
                setFormData({ ...formData, eventPic: response.data.url });
                toast.success("Image uploaded successfully");
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            const payload = { ...formData };

            // Automatically derive eventDate from quranKhawaniDate and quranKhawaniTimeSlot
            if (payload.quranKhawaniDate && payload.quranKhawaniTimeSlot) {
                const qkSlot = payload.quranKhawaniTimeSlot;
                const slotHour = qkSlot === "Morning" ? "09:00" : qkSlot === "Afternoon" ? "14:00" : qkSlot === "Evening" ? "19:00" : "09:00";
                payload.eventDate = `${payload.quranKhawaniDate}T${slotHour}`;
            }

            // Validate required fields
            if (!payload.eventTitle || !payload.eventSpecial || !payload.description || !payload.eventLocation || !payload.eventDate || !payload.joiningLink) {
                toast.error("Please fill in all required fields (Date, Time Slot, etc.)");
                setSubmitting(false);
                return;
            }

            if (isEdit && currentId) {
                await updateEvent(currentId, payload);
                toast.success("Event updated successfully");
            } else {
                await createEvent(payload);
                toast.success("Event created successfully");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Operation failed";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason !== 'backdropClick') {
                    onClose();
                }
            }}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>{isEdit ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogContent dividers sx={{ position: 'relative', minHeight: '200px' }}>
                {loadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        {/* Image Upload Section */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mt: 1, p: 2, border: '1px dashed grey', borderRadius: 2 }}>
                            {formData.eventPic && (
                                <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, height: 200 }}>
                                    <img
                                        src={formData.eventPic}
                                        alt="Event Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                    />
                                    {isUploading && (
                                        <Box sx={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8
                                        }}>
                                            <CircularProgress />
                                        </Box>
                                    )}
                                </Box>
                            )}

                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                disabled={isUploading}
                                sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                            >
                                {isUploading ? "Uploading..." : "Upload Image"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>
                            <Typography variant="caption" color="textSecondary">
                                Allowed formats: JPG, PNG, WEBP
                            </Typography>
                        </Box>

                        <TextField
                            label="Event Title"
                            name="eventTitle"
                            value={formData.eventTitle}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Special Occasion"
                            name="eventSpecial"
                            value={formData.eventSpecial}
                            onChange={handleChange}
                            fullWidth
                            sx={{ display: formData.orderId ? 'none' : 'block' }}
                            required
                            placeholder="e.g. Muharram Special"
                        />
                        <TextField
                            label="Description of event"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />
                        <Box display="flex" gap={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        name="isFeatured"
                                        color="primary"
                                    />
                                }
                                label="Featured Event"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.showOnHomePage}
                                        onChange={(e) => setFormData({ ...formData, showOnHomePage: e.target.checked })}
                                        name="showOnHomePage"
                                        color="primary"
                                    />
                                }
                                label="Show on Home Page"
                            />
                        </Box>
                        <TextField
                            label="Location"
                            name="eventLocation"
                            value={formData.eventLocation}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Event Date"
                                name="quranKhawaniDate"
                                type="date"
                                value={formData.quranKhawaniDate || ""}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="time-slot-label">Time Slot</InputLabel>
                                <Select
                                    labelId="time-slot-label"
                                    name="quranKhawaniTimeSlot"
                                    value={formData.quranKhawaniTimeSlot || ""}
                                    onChange={(e) => setFormData({ ...formData, quranKhawaniTimeSlot: e.target.value })}
                                    label="Time Slot"
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    <MenuItem value="Morning">🌅 Morning</MenuItem>
                                    <MenuItem value="Afternoon">☀️ Afternoon</MenuItem>
                                    <MenuItem value="Evening">🌙 Evening</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            label="Joining Link"
                            name="joiningLink"
                            value={formData.joiningLink || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            placeholder="https://zoom.us/..."
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={submitting}>
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
    );
};

export default EventFormDialog;
