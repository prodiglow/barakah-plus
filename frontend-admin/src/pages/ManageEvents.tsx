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
} from "@mui/material";
import { useAlertDialog } from "../contexts/AlertDialogContext";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import {
    getAllEvents,
    deleteEvent,
    EventData,
} from "../services/eventService";
import EventFormDialog from "../components/EventFormDialog";

const ManageEvents: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const { showConfirm } = useAlertDialog();
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Partial<EventData> | undefined>(undefined);

    useEffect(() => {
        fetchEvents();
    }, [refreshTrigger]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await getAllEvents();
            // Handle different response structures if necessary (e.g. data.events or direct array)
            const eventList = Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
            setEvents(eventList);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch Events");
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        setIsEdit(false);
        setCurrentId(null);
        setSelectedEvent(undefined);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentId(null);
        setIsEdit(false);
        setSelectedEvent(undefined);
    };

    const handleEdit = (event: EventData) => {
        setOpen(true);
        setIsEdit(true);
        setCurrentId(event._id || null);
        setSelectedEvent(event);
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm("Delete Event", "Are you sure you want to delete this Event?");
        if (confirmed) {
            try {
                await deleteEvent(id);
                toast.success("Event deleted successfully");
                fetchEvents();
            } catch (error) {
                toast.error("Failed to delete Event");
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Manage Events (Quran Khwanis)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpen}
                    sx={{ backgroundColor: "#04AA6D", "&:hover": { backgroundColor: "#017F52" } }}
                >
                    Add New Event
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f3f4f6" }}>
                            <TableRow>
                                <TableCell>Image</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Special</TableCell>
                                <TableCell>Description of event</TableCell>
                                <TableCell>Featured</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>QK Date</TableCell>
                                <TableCell>QK Time</TableCell>
                                <TableCell>Link</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow 
                                    key={event._id} 
                                    hover 
                                    onClick={() => {
                                        if (event.orderId) {
                                            navigate(`/admin/dashboard/orders?orderId=${event.orderId}`);
                                        }
                                    }}
                                    sx={{ cursor: event.orderId ? 'pointer' : 'default' }}
                                >
                                    <TableCell>
                                        <CardMedia
                                            component="img"
                                            sx={{ width: 50, height: 50, borderRadius: 1, objectFit: "cover" }}
                                            image={event.eventPic}
                                            alt={event.eventTitle}
                                        />
                                    </TableCell>
                                    <TableCell>{event.eventTitle}</TableCell>
                                    <TableCell>{event.eventSpecial}</TableCell>
                                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {event.description}
                                    </TableCell>
                                    <TableCell>{event.isFeatured ? "Yes" : "No"}</TableCell>
                                    <TableCell>{event.eventLocation}</TableCell>
                                    <TableCell>{event.quranKhawaniDate || "-"}</TableCell>
                                    <TableCell>{event.quranKhawaniTimeSlot || "-"}</TableCell>
                                    <TableCell>
                                        {event.joiningLink ? (
                                            <a href={event.joiningLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>
                                                Link
                                            </a>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton 
                                            color="primary" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(event);
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            color="error" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(event._id!);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {events.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                                        No Events found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <EventFormDialog
                open={open}
                onClose={handleClose}
                initialData={selectedEvent}
                onSuccess={fetchEvents}
                isEdit={isEdit}
                currentId={currentId}
            />
        </Box>
    );
};

export default ManageEvents;
