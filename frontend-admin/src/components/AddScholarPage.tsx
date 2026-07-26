import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  Chip,
} from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { createScholar } from '../services/scholarService';
import type { ScholarGender, ScholarSect } from '../services/scholarService';
import { uploadToCloudinary } from '../services/CloudinaryService';
import type { SelectChangeEvent } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SERVICE_OPTIONS = ['Dua', 'Quran Khawani', 'Wazaif and Adhkar', 'Istikhara'];
const GENDER_OPTIONS: { value: ScholarGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
const SECT_OPTIONS: ScholarSect[] = ['Shia', 'Deobandi', 'Barelvi', 'Ahl-e-Hadith'];

const AddScholarPage: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlertDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Image state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [scholarName, setScholarName] = useState('');
  const [scholarSpecialization, setScholarSpecialization] = useState('');
  const [scholarExperience, setScholarExperience] = useState('');
  const [scholarEducation, setScholarEducation] = useState('');
  const [fee, setFee] = useState('');
  const [scholarServices, setScholarServices] = useState<string[]>([]);
  const [phone_number, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<ScholarGender | ''>('');
  const [sect, setSect] = useState<ScholarSect | ''>('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
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

  const handleServiceChange = (event: SelectChangeEvent<typeof scholarServices>) => {
    const {
      target: { value },
    } = event;

    setScholarServices(Array.isArray(value) ? value : [value]);
  };

  const handleGenderChange = (event: SelectChangeEvent) => {
    setGender(event.target.value as ScholarGender);
  };

  const handleSectChange = (event: SelectChangeEvent) => {
    setSect(event.target.value as ScholarSect);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validate required fields
      if (!scholarName.trim()) {
        setError('Scholar name is required');
        setLoading(false);
        return;
      }

      if (!scholarSpecialization.trim()) {
        setError('Specialization is required');
        setLoading(false);
        return;
      }

      if (!scholarExperience.trim() || isNaN(Number(scholarExperience))) {
        setError('Valid experience (number) is required');
        setLoading(false);
        return;
      }

      if (!scholarEducation.trim()) {
        setError('Education is required');
        setLoading(false);
        return;
      }

      if (!fee.trim() || isNaN(Number(fee))) {
        setError('Valid fee (number) is required');
        setLoading(false);
        return;
      }

      if (scholarServices.length === 0) {
        setError('At least one service is required');
        setLoading(false);
        return;
      }

      if (!gender) {
        setError('Gender is required');
        setLoading(false);
        return;
      }

      if (!sect) {
        setError('Sect is required');
        setLoading(false);
        return;
      }

      if (!phone_number.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      if (phone_number.length !== 11 || isNaN(Number(phone_number))) {
        setError('Phone number must be exactly 11 digits');
        setLoading(false);
        return;
      }

      if (!selectedImage) {
        toast.error('Please select a profile image', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
        setLoading(false);
        return;
      }

      let imageUrl = '';

      // Upload image first if selected
      if (selectedImage) {
        try {
          setUploadingImage(true);
          // Get token from localStorage
          const token = localStorage.getItem('adminToken');
          if (!token) {
            setError('Authentication token not found. Please login again.');
            setLoading(false);
            setUploadingImage(false);
            return;
          }

          // Upload to Cloudinary
          imageUrl = await uploadToCloudinary(selectedImage, token);
          setUploadingImage(false);
        } catch (err: unknown) {
          console.error('Error uploading image:', err);
          const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to upload image. Please try again.';
          setError(errorMessage);
          setLoading(false);
          setUploadingImage(false);
          return;
        }
      }

      // Prepare data
      const scholarData = {
        scholarName: capitalizeFirstLetter(scholarName.trim()),
        scholarSpecialization: parseArrayField(scholarSpecialization),
        scholarExperience: Number(scholarExperience),
        scholarEducation: parseArrayField(scholarEducation),
        ProfileImg: imageUrl,
        fee: Number(fee),
        scholarServices: scholarServices, // Already an array
        phone_number: phone_number,
        gender: gender as ScholarGender,
        sect: sect as ScholarSect,
        rating: 0,
        blessings: 0
      };

      await createScholar(scholarData);
      setSuccess(true);

      const successMsg = `Dear ${capitalizeFirstLetter(scholarName.trim())},\n\nWelcome to Baraka! Your registration on the platform has been successfully completed.`;
      await showAlert('Success', successMsg, 'success');

      navigate('/admin/dashboard/manage-scholars');
    } catch (err: unknown) {
      console.error('Error creating scholar:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create scholar. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        width: '100%',
        py: { xs: 2, md: 4 },
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          navigate('/admin/dashboard/manage-scholars');
        }}
        sx={{ width: "30%", margin: "0 auto", mb: 3, ml: { xs: 3, sm: 3, md: 0 }, color: 'text.secondary' }}
      >
        Back to Dashboard
      </Button>

      <Paper
        elevation={3}
        sx={{
          width: '100%',
          borderRadius: 2,
          py: { sm: 2, xs: 2, md: 4 }
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 'bold',
            mb: 4,
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Add New Scholar
        </Typography>

        {/* Profile Image Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Avatar
            src={imagePreview || undefined}
            sx={{
              width: { xs: 120, md: 150 },
              height: { xs: 120, md: 150 },
              mb: 2,
              bgcolor: 'grey.300',
              fontSize: { xs: '3rem', md: '4rem' }
            }}
          >
            {!imagePreview && 'No Image'}
          </Avatar>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={handleUploadClick}
            disabled={uploadingImage}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 3
            }}
          >
            {uploadingImage ? 'Uploading...' : 'Upload Profile Image'}
          </Button>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ width: { xs: "70%", sm: "70%", md: "78%" }, margin: "0 auto", mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Scholar created successfully! Redirecting...
            </Alert>
          )}

          <Box sx={{ width: "80%", margin: "0 auto", display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Scholar Name *"
              value={scholarName}
              onChange={(e) => setScholarName(e.target.value)}
              required
              margin="normal"
              sx={{ flex: 1 }}
            />
            <TextField
              fullWidth
              label="Experience (years) *"
              type="number"
              value={scholarExperience}
              onChange={(e) => setScholarExperience(e.target.value)}
              required
              margin="normal"
              inputProps={{ min: 0 }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ width: "80%", margin: "0 auto", display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Specialization (comma-separated) *"
              value={scholarSpecialization}
              onChange={(e) => setScholarSpecialization(e.target.value)}
              placeholder="e.g., Fiqh, Hadith"
              required
              margin="normal"
              helperText="Enter multiple specializations separated by commas"
              sx={{ flex: 1 }}
            />
            <TextField
              fullWidth
              label="Education (comma-separated) *"
              value={scholarEducation}
              onChange={(e) => setScholarEducation(e.target.value)}
              placeholder="e.g., Darse Nizami, Jamia - e - Nizaamia"
              required
              margin="normal"
              helperText="Enter multiple education entries separated by commas"
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ width: "80%", margin: "0 auto", display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Fee *"
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
              sx={{ flex: 1 }}
            />
            {/* Services Dropdown */}
            <FormControl fullWidth margin="normal" required sx={{ flex: 1 }}>
              <InputLabel id="scholar-services-label">Services</InputLabel>
              <Select
                labelId="scholar-services-label"
                id="scholar-services"
                multiple
                value={scholarServices}
                onChange={handleServiceChange}
                input={<OutlinedInput id="select-multiple-chip" label="Services" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {SERVICE_OPTIONS.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: "80%", margin: "0 auto", display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={phone_number}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // Only numbers
                if (val.length <= 11) {
                  setPhoneNumber(val);
                }
              }}
              required
              margin="normal"
              placeholder="e.g., 03001234567"
              helperText="Must be exactly 11 digits"
              sx={{ flex: 1 }}
              inputProps={{ maxLength: 11 }}
            />
            {/* Gender Dropdown */}
            <FormControl fullWidth margin="normal" required sx={{ flex: 1 }}>
              <InputLabel id="scholar-gender-label">Gender</InputLabel>
              <Select
                labelId="scholar-gender-label"
                id="scholar-gender"
                value={gender}
                label="Gender"
                onChange={handleGenderChange}
              >
                {GENDER_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: "80%", margin: "0 auto", display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* Sect Dropdown */}
            <FormControl fullWidth margin="normal" required sx={{ flex: 1 }}>
              <InputLabel id="scholar-sect-label">Sect</InputLabel>
              <Select
                labelId="scholar-sect-label"
                id="scholar-sect"
                value={sect}
                label="Sect"
                onChange={handleSectChange}
              >
                {SECT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} /> {/* Spacer */}
          </Box>

          <Box sx={{ width: "79%", margin: "0 auto", mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Rating and Blessings will be set to 0 automatically.
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/admin/dashboard/manage-scholars');
              }}
              disabled={loading || uploadingImage}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 4
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || uploadingImage}
              sx={{
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)',
                textTransform: 'none',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(180deg, #098B62 0%, #087955 49.04%, #076A48 100%)',
                },
                '&:disabled': {
                  background: 'grey.300'
                }
              }}
            >
              {loading || uploadingImage ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Add Scholar'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddScholarPage;

