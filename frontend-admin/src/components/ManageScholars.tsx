import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    IconButton,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    TextField,
    FormControl,
    InputLabel,
    OutlinedInput,
    Select,
    MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchScholars, deleteScholar, updateScholar } from '../services/scholarService';
import type { ScholarGender, ScholarSect } from '../services/scholarService';
import { Scholar } from '../types/Scholars';
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from '../services/CloudinaryService';
import { AuthContext } from '../contexts/AuthContext';

const SERVICE_OPTIONS = ['Dua', 'Quran Khawani', 'Wazaif and Adhkar', 'Istikhara'];
const GENDER_OPTIONS: { value: ScholarGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
const SECT_OPTIONS: ScholarSect[] = ['Shia', 'Deobandi', 'Barelvi', 'Ahl-e-Hadith'];

const ManageScholars: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
    const [scholars, setScholars] = useState<Scholar[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [scholarToDelete, setScholarToDelete] = useState<Scholar | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [scholarToEdit, setScholarToEdit] = useState<Scholar | null>(null);
    const [editFormData, setEditFormData] = useState({
        scholarName: '',
        scholarExperience: 0,
        fee: 0,
        scholarSpecialization: '',
        scholarEducation: '',
        scholarServices: [] as string[],
        phone_number: '',
        gender: '' as ScholarGender | '',
        sect: '' as ScholarSect | '',
    });
    const [updating, setUpdating] = useState(false);

    // Image upload states
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Field validation errors
    const [fieldErrors, setFieldErrors] = useState<{
        scholarName?: string;
        scholarExperience?: string;
        fee?: string;
        scholarSpecialization?: string;
        scholarEducation?: string;
        scholarServices?: string;
        profileImage?: string;
        phone_number?: string;
        gender?: string;
        sect?: string;
    }>({});

    // Get auth context for token
    const authContext = useContext(AuthContext);
    const token = authContext?.token || '';

    useEffect(() => {
        loadScholars();
    }, [refreshTrigger]);

    const loadScholars = async () => {
        try {
            setLoading(true);
            const data = await fetchScholars();
            setScholars(data);
        } catch (err) {
            console.error('Error fetching scholars:', err);
            toast.error('Failed to load scholars. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const capitalizeFirstLetter = (str: string): string => {
        return str
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const parseArrayField = (value: string): string[] => {
        return value
            .split(',')
            .map(item => capitalizeFirstLetter(item.trim()))
            .filter(item => item !== '');
    };

    const handleEditClick = (scholar: Scholar) => {
        setScholarToEdit(scholar);
        setEditFormData({
            scholarName: scholar.scholarName,
            scholarExperience: scholar.scholarExperience,
            fee: scholar.fee,
            scholarSpecialization: (scholar.scholarSpecialization ?? []).map(s => s?.name ?? '').join(', '),
            scholarEducation: (scholar.scholarEducation ?? []).map(e => e?.name ?? '').join(', '),
            scholarServices: (scholar.scholarServices ?? []).map(s => s?.name ?? ''),
            phone_number: scholar.phone_number || '',
            gender: scholar.gender || '',
            sect: scholar.sect || '',
        });
        // Set profile image preview
        setProfileImagePreview(scholar.ProfileImg || '');
        setProfileImage(null);
        // Clear field errors
        setFieldErrors({});
        setEditDialogOpen(true);
    };

    const handleEditFormChange = (field: string, value: string | number) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear field error when user types
        if (fieldErrors[field as keyof typeof fieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleServiceChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        setEditFormData(prev => ({
            ...prev,
            scholarServices: Array.isArray(value) ? value : [value],
        }));
        // Clear service error
        if (fieldErrors.scholarServices) {
            setFieldErrors(prev => ({ ...prev, scholarServices: undefined }));
        }
    };

    const handleGenderChange = (event: SelectChangeEvent) => {
        handleEditFormChange('gender', event.target.value);
    };

    const handleSectChange = (event: SelectChangeEvent) => {
        handleEditFormChange('sect', event.target.value);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setFieldErrors(prev => ({ ...prev, profileImage: 'Only JPG, JPEG, and PNG files are allowed' }));
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setFieldErrors(prev => ({ ...prev, profileImage: 'File size must be less than 5MB' }));
            return;
        }

        // Clear previous error
        setFieldErrors(prev => ({ ...prev, profileImage: undefined }));

        // Set file and create preview
        setProfileImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleEditConfirm = async () => {
        if (!scholarToEdit) return;

        // Clear previous errors
        const errors: typeof fieldErrors = {};

        // Validate all required fields with inline errors
        if (!editFormData.scholarName.trim()) {
            errors.scholarName = 'Scholar name is required';
        }

        if (!editFormData.scholarExperience || editFormData.scholarExperience <= 0) {
            errors.scholarExperience = 'Valid experience is required';
        }

        if (!editFormData.fee || editFormData.fee <= 0) {
            errors.fee = 'Valid fee is required';
        }

        if (!editFormData.scholarSpecialization.trim()) {
            errors.scholarSpecialization = 'Specialization is required';
        }

        if (!editFormData.scholarEducation.trim()) {
            errors.scholarEducation = 'Education is required';
        }

        if (!editFormData.scholarServices || editFormData.scholarServices.length === 0) {
            errors.scholarServices = 'At least one service is required';
        }

        if (!editFormData.phone_number.trim()) {
            errors.phone_number = 'Phone number is required';
        } else if (editFormData.phone_number.length !== 11) {
            errors.phone_number = 'Phone number must be exactly 11 digits';
        }

        if (!editFormData.gender) {
            errors.gender = 'Gender is required';
        }

        if (!editFormData.sect) {
            errors.sect = 'Sect is required';
        }

        // If there are errors, set them and return
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        try {
            setUpdating(true);

            let profileImageUrl = scholarToEdit.ProfileImg; // Keep existing image by default

            // Upload new image to Cloudinary if selected
            if (profileImage) {
                try {
                    setUploadingImage(true);

                    // Delete old image from Cloudinary if it exists
                    if (scholarToEdit.ProfileImg) {
                        try {
                            const oldPublicId = getPublicIdFromUrl(scholarToEdit.ProfileImg);
                            if (oldPublicId) {
                                await deleteFromCloudinary(oldPublicId, token);
                            }
                        } catch (deleteError) {
                            console.error('Error deleting old image:', deleteError);
                            // Continue with upload even if delete fails
                        }
                    }

                    // Upload new image
                    profileImageUrl = await uploadToCloudinary(profileImage, token);
                } catch (uploadError) {
                    console.error('Error uploading image:', uploadError);
                    toast.error('Failed to upload image. Please try again.');
                    return;
                } finally {
                    setUploadingImage(false);
                }
            }

            const updateData = {
                scholarName: capitalizeFirstLetter(editFormData.scholarName.trim()),
                scholarExperience: editFormData.scholarExperience,
                fee: editFormData.fee,
                scholarSpecialization: parseArrayField(editFormData.scholarSpecialization),
                scholarEducation: parseArrayField(editFormData.scholarEducation),
                scholarServices: editFormData.scholarServices,
                phone_number: editFormData.phone_number,
                gender: editFormData.gender as ScholarGender,
                sect: editFormData.sect as ScholarSect,
                ProfileImg: profileImageUrl, // Include profile image URL
            };

            await updateScholar(scholarToEdit._id, updateData);

            // Close dialog
            setEditDialogOpen(false);
            setScholarToEdit(null);

            // Show success message immediately
            toast.success('Scholar updated successfully!');

            // Refresh data after showing the toast (1 second delay)
            setTimeout(async () => {
                await loadScholars();
            }, 2000);

        } catch (err) {
            console.error('Error updating scholar:', err);
            toast.error('Failed to update scholar. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const handleEditCancel = () => {
        setEditDialogOpen(false);
        setScholarToEdit(null);
    };

    const handleDeleteClick = (scholar: Scholar) => {
        setScholarToDelete(scholar);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!scholarToDelete) return;

        try {
            setDeleting(true);
            await deleteScholar(scholarToDelete._id);
            setScholars(scholars.filter(s => s._id !== scholarToDelete._id));
            setDeleteDialogOpen(false);
            setScholarToDelete(null);
            toast.success('Scholar deleted successfully!');
        } catch (err) {
            console.error('Error deleting scholar:', err);
            toast.error('Failed to delete scholar. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setScholarToDelete(null);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth={false} sx={{ py: 4 }}>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                style={{ zIndex: 9999 }}
            />

            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Manage Scholars
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Profile</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Experience</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Education</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Specialization</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Services</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Rating</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Blessings</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {scholars.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No scholars found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            scholars.map(scholar => (
                                <TableRow key={scholar._id} sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                                    <TableCell>
                                        <Avatar
                                            src={scholar.ProfileImg}
                                            alt={scholar.scholarName}
                                            sx={{ width: 50, height: 50 }}
                                        >
                                            {scholar.scholarName?.charAt(0) ?? ''}
                                        </Avatar>
                                    </TableCell>

                                    <TableCell>{scholar.scholarName}</TableCell>

                                    <TableCell>{scholar.scholarExperience} years</TableCell>

                                    {/* EDUCATION SAFE */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {(scholar.scholarEducation ?? []).map(edu => (
                                                <Chip
                                                    key={edu?._id ?? edu?.name}
                                                    label={edu?.name ?? ''}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>

                                    {/* SPECIALIZATION SAFE */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {(scholar.scholarSpecialization ?? []).map(spec => (
                                                <Chip
                                                    key={spec?._id ?? spec?.name}
                                                    label={spec?.name ?? ''}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>

                                    {/* SERVICES SAFE */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            {(scholar.scholarServices ?? []).map(service => (
                                                <Chip
                                                    key={service?._id ?? service?.name}
                                                    label={service?.name ?? ''}
                                                    size="small"
                                                    color="secondary"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{scholar.phone_number}</TableCell>
                                    <TableCell>PKR {scholar.fee}</TableCell>
                                    <TableCell>{scholar.rating}</TableCell>
                                    <TableCell>{scholar.blessings}</TableCell>

                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Edit Scholar">
                                                <IconButton color="primary" onClick={() => handleEditClick(scholar)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Scholar">
                                                <IconButton color="error" onClick={() => handleDeleteClick(scholar)}>
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer >

            {/* DELETE DIALOG */}
            < Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete{' '}
                        <strong>{scholarToDelete?.scholarName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        {deleting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog >

            {/* EDIT DIALOG */}
            <Dialog open={editDialogOpen} onClose={handleEditCancel} maxWidth="md" fullWidth>
                <DialogTitle>Edit Scholar</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Profile Image Upload */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Profile Image
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                {profileImagePreview && (
                                    <Avatar
                                        src={profileImagePreview}
                                        sx={{ width: 100, height: 100 }}
                                    />
                                )}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            </Box>
                            {fieldErrors.profileImage && (
                                <Typography variant="caption" color="error">
                                    {fieldErrors.profileImage}
                                </Typography>
                            )}
                        </Box>

                        <TextField
                            label="Scholar Name"
                            value={editFormData.scholarName}
                            onChange={(e) => handleEditFormChange('scholarName', e.target.value)}
                            fullWidth
                            error={!!fieldErrors.scholarName}
                            helperText={fieldErrors.scholarName}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Experience"
                                type="number"
                                value={editFormData.scholarExperience}
                                onChange={(e) => handleEditFormChange('scholarExperience', Number(e.target.value))}
                                fullWidth
                                error={!!fieldErrors.scholarExperience}
                                helperText={fieldErrors.scholarExperience}
                            />
                            <TextField
                                label="Fee"
                                type="number"
                                value={editFormData.fee}
                                onChange={(e) => handleEditFormChange('fee', Number(e.target.value))}
                                fullWidth
                                error={!!fieldErrors.fee}
                                helperText={fieldErrors.fee}
                            />
                        </Box>

                        <TextField
                            label="Specialization (comma-separated)"
                            value={editFormData.scholarSpecialization}
                            onChange={(e) => handleEditFormChange('scholarSpecialization', e.target.value)}
                            fullWidth
                            error={!!fieldErrors.scholarSpecialization}
                            helperText={fieldErrors.scholarSpecialization}
                        />

                        <TextField
                            label="Education (comma-separated)"
                            value={editFormData.scholarEducation}
                            onChange={(e) => handleEditFormChange('scholarEducation', e.target.value)}
                            fullWidth
                            error={!!fieldErrors.scholarEducation}
                            helperText={fieldErrors.scholarEducation}
                        />

                        <TextField
                            label="Phone Number"
                            value={editFormData.phone_number}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 11) {
                                    handleEditFormChange('phone_number', val);
                                }
                            }}
                            fullWidth
                            error={!!fieldErrors.phone_number}
                            helperText={fieldErrors.phone_number || "Must be 11 digits"}
                            inputProps={{ maxLength: 11 }}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth error={!!fieldErrors.gender}>
                                <InputLabel id="edit-scholar-gender-label">Gender</InputLabel>
                                <Select
                                    labelId="edit-scholar-gender-label"
                                    value={editFormData.gender}
                                    label="Gender"
                                    onChange={handleGenderChange}
                                >
                                    {GENDER_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.gender && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                        {fieldErrors.gender}
                                    </Typography>
                                )}
                            </FormControl>

                            <FormControl fullWidth error={!!fieldErrors.sect}>
                                <InputLabel id="edit-scholar-sect-label">Sect</InputLabel>
                                <Select
                                    labelId="edit-scholar-sect-label"
                                    value={editFormData.sect}
                                    label="Sect"
                                    onChange={handleSectChange}
                                >
                                    {SECT_OPTIONS.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.sect && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                        {fieldErrors.sect}
                                    </Typography>
                                )}
                            </FormControl>
                        </Box>

                        <FormControl fullWidth error={!!fieldErrors.scholarServices}>
                            <InputLabel>Services</InputLabel>
                            <Select
                                multiple
                                value={editFormData.scholarServices}
                                onChange={handleServiceChange}
                                input={<OutlinedInput label="Services" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {SERVICE_OPTIONS.map(service => (
                                    <MenuItem key={service} value={service}>
                                        {service}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.scholarServices && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                    {fieldErrors.scholarServices}
                                </Typography>
                            )}
                        </FormControl>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleEditCancel}>Cancel</Button>
                    <Button onClick={handleEditConfirm} variant="contained" color="primary">
                        {updating ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog >
        </Container >
    );
};

export default ManageScholars;
