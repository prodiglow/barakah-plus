import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Tooltip,
  ListSubheader,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAlertDialog } from "../../context/AlertDialogContext";
import { toast } from "react-toastify";
import { styled } from "@mui/system";
import FindScholarPop from "../book_now/FindScholarPop";
import CloseIcon from "@mui/icons-material/Close";
import { Scholar } from "../../types/Scholars";
import { addToCart, updateCartItem } from "../../services/cartService";
import { createOrder } from "../../services/orderService";
import { AddToCartPayload } from "../../types/AddToCartPayload";
import { CartItem } from "../../types/cart";
import { uploadAudioToCloudinary } from "../../services/CloudinaryAudioService";
import { cartEvents } from "../cart/cartEvents";
import SignupForm from "../SignupForm";

// --- Styles ---
const StyledHeader = styled(Typography)({
  backgroundColor: "#212121",
  color: "#fff",
  padding: "10px 0px",
  textAlign: "center",
  borderTopLeftRadius: "25px",
  borderTopRightRadius: "25px",
  width: "100%",
  margin: "0 auto 20px auto",
});

const MainContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "#fff",
  paddingBottom: "35px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  width: "70%",
  margin: "40px auto",
  [theme.breakpoints.down("sm")]: {
    width: "95%",
    paddingBottom: "0px",
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#757575" },
    "&:hover fieldset": { borderColor: "#424242" },
    "&.Mui-focused fieldset": { borderColor: "#1976d2" },
  },
  backgroundColor: "#fff",
});

const StyledButton = styled(Button)({
  color: "#fff",
  margin: "0 auto 20px auto",
  width: "94%",
  transition: "all 0.3s ease-in-out",
  backgroundColor: "#F69320",
  "&:hover": { scale: 1.05 },
});

const VoiceNoteButton = styled(Button)({
  color: "#F69320",
  padding: "10px",
  width: "94%",
  margin: "0 auto 20px auto",
  backgroundColor: "#fff",
  border: "2px solid #F69320",
  "&:hover": { scale: 1.05 },
});

const FeatureBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  paddingTop: "40px",
  paddingBottom: "30px",
  backgroundColor: "white",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
}));

const FeatureItem = styled(Typography)({
  display: "flex",
  alignItems: "center",
  color: "#2e7d32",
  backgroundColor: "#fff",
});

// --- Helper Function (Moved Outside) ---
const getSupportedMimeType = () => {
  const types = [
    "audio/webm", // Chrome, Firefox, Edge
    "audio/mp4",  // Safari (iPhone/Mac)
    "audio/ogg",
    "audio/wav"
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return ""; // Fallback
};

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Compute min selectable date: today + 3 days (Safari-safe)
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface BookYourSpirtualFormProps {
  activeTab: number;
  selectedScholar?: Scholar | null;
  onScholarChange?: (scholar: Scholar | null) => void;
  isServiceDisabled?: boolean;
  isEditMode?: boolean;
  editData?: CartItem;
  onEditSuccess?: () => void;
  onCancelEdit?: () => void;
}

interface FormData {
  userID: string | null;
  name: string;
  motherName: string;
  gender: string;
  contact: string;
  sect: string;
  reason: string;
  language: string;
  message: string;
  scholarID: string;
  audioUrl: string;
  service: string;
  fee: number;
  selectWazifa: string;
}

interface Errors {
  name?: string;
  gender?: string;
  contact?: string;
  sect?: string;
  reason?: string;
  scholar?: string;
  parahAyat?: string;
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  audio?: string;
  selectWazifa?: string;
}

const FEATURE_TOOLTIP = "Your Quran khani will appear in the live events section of our home page, allowing anybody to join the event remotely to pray for you and multiply your Baraka";

const BookYourSpirtualForm: React.FC<BookYourSpirtualFormProps> = ({
  activeTab,
  selectedScholar,
  onScholarChange,
  isServiceDisabled = false,
  isEditMode = false,
  editData,
  onEditSuccess,
  onCancelEdit,
}) => {
  const { showAlert } = useAlertDialog();
  const [formData, setFormData] = useState<FormData>({
    userID: "",
    name: "",
    motherName: "",
    gender: "",
    contact: "",
    sect: "",
    reason: "",
    language: "",
    message: "",
    scholarID: "",
    audioUrl: "",
    service: "",
    fee: 0,
    selectWazifa: "",
  });

  const [serviceReason, setServiceReason] = useState("");
  const [parahAyat, setParahAyat] = useState("");
  const [selectedScholarId, setSelectedScholarId] = useState<Scholar | null>(
    selectedScholar || null
  );
  const [errors, setErrors] = useState<Errors>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openQKSuccessDialog, setOpenQKSuccessDialog] = useState(false); // QK-specific success dialog
  const [openRecordingConfirmDialog, setOpenRecordingConfirmDialog] = useState(false);

  // Quran Khawani specific state
  const [quranKhawaniDate, setQuranKhawaniDate] = useState("");
  const [quranKhawaniTimeSlot, setQuranKhawaniTimeSlot] = useState("");
  const [featureOnHomePage, setFeatureOnHomePage] = useState(false);

  // Audio recorder states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSunni, setShowSunni] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_RECORDING_SECONDS = 120; // 2 minutes
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedScholar) {
      setSelectedScholarId(selectedScholar);
      setFormData(prev => ({
        ...prev,
        scholarID: selectedScholar._id,
        fee: selectedScholar.fee,
        userID: localStorage.getItem("userId")
      }));
    }
  }, [selectedScholar]);

  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        userID: editData.userID || localStorage.getItem("userId"),
        name: editData.name || "",
        motherName: editData.motherName || "",
        gender: editData.gender || "",
        contact: editData.contact || "",
        sect: editData.sect || "",
        reason: editData.reason || "",
        language: editData.language || "",
        message: editData.message || "",
        scholarID: typeof editData.scholarID === 'string' ? editData.scholarID : (editData.scholarID?._id || ""),
        audioUrl: editData.audioUrl || "",
        service: editData.service || "",
        fee: editData.fee || 0,
        selectWazifa: editData.selectWazifa || "",
      });
      if (editData.quranKhawaniDate) setQuranKhawaniDate(editData.quranKhawaniDate.split('T')[0]);
      if (editData.quranKhawaniTimeSlot) setQuranKhawaniTimeSlot(editData.quranKhawaniTimeSlot);
      if (editData.featureOnHomePage) setFeatureOnHomePage(editData.featureOnHomePage);
      if (editData.scholarID && typeof editData.scholarID !== 'string') {
        setSelectedScholarId(editData.scholarID as unknown as Scholar);
      }
      if (editData.audioUrl) {
        setAudioURL(editData.audioUrl);
      }
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    let serviceName = "";
    switch (activeTab) {
      case 0: serviceName = "Personal Dua"; break;
      case 4: serviceName = "Personal Dua"; break;
      case 1: serviceName = "Quran Khawani"; break;
      case 2: serviceName = "Wazaif and Adhkar"; break;
      case 3: serviceName = "Isthekhara"; break;
      case 5: serviceName = "Quran O Hadith"; break;
      default: serviceName = "";
    }
    setServiceReason(serviceName);
  }, [activeTab]);

  // Reset QK-specific fields when switching away from QK tab
  useEffect(() => {
    if (activeTab !== 1) {
      setQuranKhawaniDate("");
      setQuranKhawaniTimeSlot("");
      setFeatureOnHomePage(false);
    }
  }, [activeTab]);

  // --- AUTO-FETCH FEE FOR QURAN KHAWANI (Tab 1) ---
  const [quranKhawaniFee, setQuranKhawaniFee] = useState<number>(0);
  const [quranKhawaniScholarId, setQuranKhawaniScholarId] = useState<string>("");

  useEffect(() => {
    const fetchFee = async () => {
      if (activeTab === 1 && formData.sect) {
        let targetId = "";
        if (["Sunni", "Deobandi", "Barelvi", "Ahl-e-Hadith"].includes(formData.sect)) {
          targetId = "68f0a62920f6d6ea28513c37";
        } else {
          targetId = "68f096b14829b2ccef2c6e3e";
        }

        if (targetId) {
          try {
            const { fetchScholars } = await import("../../services/scholarService");
            const scholars = await fetchScholars();
            const found = scholars.find((s: any) => s._id === targetId);
            if (found) {
              setQuranKhawaniFee(found.fee);
              setQuranKhawaniScholarId(found._id);
            }
          } catch (err) {
            console.error("Failed to fetch scholar fee", err);
          }
        }
      }
    };
    fetchFee();
  }, [activeTab, formData.sect]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

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

  // --- RECORDING LOGIC ---
  const handleRecordClick = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getSupportedMimeType();

        if (!mimeType) {
          await showAlert('Error', "Audio recording is not supported in this browser.", 'error');
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
          // Determine type one last time to ensure blob matches
          const blob = new Blob(audioChunks.current, { type: mimeType });
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioURL(url);

          if (startTimeRef.current) {
            const durationMs = Date.now() - startTimeRef.current;
            setAudioDuration(formatDuration(durationMs));
          }
        };

        // Removed timeslice (1000ms) which was causing broken/inflated duration in Safari
        mediaRecorder.start();
        startTimeRef.current = Date.now();
        setRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
        await showAlert('Error', "Please allow microphone access!", 'error');
      }
    } else {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    }
  };

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.gender) newErrors.gender = "Required";
    if (!formData.contact) newErrors.contact = "Required";
    if (!formData.sect) newErrors.sect = "Required";
    // For Quran O Hadith (tab 5), require parahAyat instead of reason
    if (activeTab === 5) {
      if (!parahAyat.trim()) newErrors.parahAyat = "Required";
    } else {
      if (!formData.reason) newErrors.reason = "Required";
      if (formData.reason === "Other" && !formData.message) newErrors.reason = "Required";
    }
    // Scholar is optional only for Free Personal Dua (tab 4) or Quran Khawani (tab 1)
    if (!selectedScholarId && activeTab !== 4 && activeTab !== 1) newErrors.scholar = "Please select a scholar";

    // Quran Khawani specific validations
    if (activeTab === 1) {
      if (!quranKhawaniDate) newErrors.quranKhawaniDate = "Please select a date";
      if (!quranKhawaniTimeSlot) newErrors.quranKhawaniTimeSlot = "Please select a time slot";
    }

    if (activeTab !== 1) {
      if (!audioURL) {
        newErrors.audio = "Voice Note is required for this service";
      }
    }

    if (activeTab === 2) {
      if (!formData.selectWazifa) newErrors.selectWazifa = "Please select a Wazifa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScholarSelect = (scholar: Scholar) => {
    setSelectedScholarId(scholar);
    if (onScholarChange) onScholarChange(scholar);
    formData.scholarID = scholar._id;
    formData.fee = scholar.fee;
    setFormData(prev => ({
      ...prev,
      scholarID: scholar._id,
      fee: scholar.fee,
      userID: localStorage.getItem("userId")
    }));
    setOpenDialog(false);
    setErrors((prev) => ({ ...prev, scholar: undefined }));
  };

  const resetForm = () => {
    setFormData({
      userID: "", name: "", motherName: "", gender: "", contact: "", sect: "",
      reason: "", language: "", message: "", scholarID: "", audioUrl: "",
      service: "", fee: 0, selectWazifa: "",
    });
    setSelectedScholarId(null);
    if (onScholarChange) onScholarChange(null);
    setAudioBlob(null);
    setAudioURL(null);
    setAudioDuration(null);
    setErrors({});
    setQuranKhawaniDate("");
    setQuranKhawaniTimeSlot("");
    setFeatureOnHomePage(false);
  };

  const handleAuthSuccess = () => {
    setOpenSignUp(false);
    toast.success("You are logged in! Please submit the form again.");
  };

  const handleSubmit = async (skipConfirmation = false) => {
    // FIRST: If recording is active, stop it and show confirmation dialog
    // This happens BEFORE validation so recording is stopped regardless of form state
    if (recording && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        // Stop the recording to save the blob
        mediaRecorderRef.current.stop();
        // Sync React state, otherwise UI still shows "Stop Recording"
        setRecording(false);
        // Wait briefly for the 'stop' event to process in the background (state updates)
        // We set the dialog to open, aborting the current submit
        setOpenRecordingConfirmDialog(true);
        return;
      } catch (err) {
        console.error("Error stopping recording during submit:", err);
      }
    }

    // THEN: Validate form fields
    if (!validate()) return;
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      toast.info("Please sign up or log in to submit your request!");
      setOpenSignUp(true);
      return;
    }

    setSubmitting(true);
    let cloudinaryAudioUrl = formData.audioUrl;
    let blobToUpload = audioBlob;

    // NEW: If audio is already recorded but not confirmed via dialog, show dialog
    if (audioBlob && !skipConfirmation) {
      setOpenRecordingConfirmDialog(true);
      setSubmitting(false);
      return;
    }

    if (blobToUpload) {
      try {
        // ✅ DYNAMIC EXTENSION LOGIC (Correct)
        const extension = blobToUpload.type.split("/")[1]?.split(";")[0] || "webm";
        const file = new File([blobToUpload], `voice_note.${extension}`, { type: blobToUpload.type });

        const token = localStorage.getItem("token") || "";
        const cloudinaryResponse = await uploadAudioToCloudinary(file, token);
        cloudinaryAudioUrl = cloudinaryResponse.url;

      } catch (err) {
        console.error("❌ Failed to upload audio:", err);
        toast.error("Failed to upload audio. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    // Direct Order Creation for Free Personal Dua (tab 4) or Quran O Hadith (tab 5)
    if (activeTab === 4 || activeTab === 5) {
      const orderData: any = {
        OrderTitle: activeTab === 5 ? "Quran O Hadith" : "Personal Dua",
        UserID: localStorage.getItem("userId"),
        // No ScholarID here — the backend owns gender+sect scholar matching for
        // free-flow orders (OrderAmt === 0) and always assigns a real scholar.
        // This used to compute one client-side using two hardcoded scholar IDs
        // and a sect check that could fall through to null; that duplicated,
        // stale logic is removed rather than kept in sync with the backend.
        OrderAmt: 0,
        PaymentStatus: "Paid",
        Status: "Pending Admin Review",
        name: formData.name,
        motherName: formData.motherName || "",
        gender: formData.gender,
        phone: formData.contact,
        Sect: formData.sect,
        Reason: activeTab === 5 ? "" : formData.reason,
        PrefferedLanguage: formData.language || "",
        message: activeTab === 5
          ? `${parahAyat}${formData.message ? `\n${formData.message}` : ""}`
          : (formData.message || ""),
        AudioURL: cloudinaryAudioUrl,
      };

      try {
        await createOrder(orderData);
        toast.success(activeTab === 5 ? "Quran O Hadith request submitted successfully! ✅" : "Free Personal Dua request submitted successfully! ✅");
        resetForm();
        setParahAyat(""); // Reset parahAyat field
      } catch (err: unknown) {
        console.error("Failed to create free order:", err);
        toast.error("Failed to submit request.");
      } finally {
        setSubmitting(false);
      }
      return;
    }



    // Determine Scholar ID and Fee for payload
    let finalScholarID = selectedScholarId?._id || "";
    let finalFee = selectedScholarId?.fee || 0;

    if (activeTab === 1) {
      // Use the fetched values for Quran Khawani
      finalScholarID = quranKhawaniScholarId;
      finalFee = quranKhawaniFee;
    }

    const payload: AddToCartPayload = {
      userID: localStorage.getItem("userId"),
      scholarID: finalScholarID,
      service: serviceReason,
      fee: finalFee,
      name: formData.name,
      motherName: formData.motherName || "",
      gender: formData.gender,
      contact: formData.contact,
      sect: formData.sect,
      reason: formData.reason,
      language: formData.language || "",
      message: formData.message || "",
      audioUrl: cloudinaryAudioUrl,
      ...(activeTab === 2 && {
        selectWazifa: formData.selectWazifa,
      }),
      // Quran Khawani specific fields
      ...(activeTab === 1 && {
        quranKhawaniDate,
        quranKhawaniTimeSlot,
        featureOnHomePage,
      }),
    };

    try {
      if (isEditMode && editData && editData._id) {
        await updateCartItem(editData._id, payload as any);
        toast.success("Request updated successfully! ✅");
        cartEvents.emit();
        if (onEditSuccess) onEditSuccess();
      } else {
        await addToCart(payload);
        cartEvents.emit();

        // For Quran Khawani: show special success dialog
        if (activeTab === 1) {
          setOpenQKSuccessDialog(true);
        } else {
          setOpenSuccessDialog(true);
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        await showAlert('Error', errorMessage, 'error');
        console.error("Failed to add to cart:", errorMessage);
      } else if (err instanceof Error) {
        await showAlert('Error', err.message, 'error');
        console.error("Failed to add to cart:", err.message);
      } else {
        console.error("Failed to add to cart:", err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainContainer>
      <StyledHeader variant="h6">Book Your Spiritual Services</StyledHeader>
      {isServiceDisabled && (
        <Typography
          color="error"
          align="center"
          sx={{ mb: 3, fontWeight: "bold", backgroundColor: "#ffebee", p: 2, borderRadius: 1, mx: { xs: 2, sm: 5 } }}
        >
          This service is not available for the selected scholar. Please reselect a scholar using the button below.
        </Typography>
      )}
      <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: "15px", px: { xs: 2, sm: 5 }, mb: 3, opacity: isServiceDisabled ? 0.6 : 1, pointerEvents: isServiceDisabled ? "none" : "auto" }}>

          <StyledTextField fullWidth label="Enter your name*" variant="outlined" name="name" value={formData.name} onChange={handleInputChange} error={!!errors.name} helperText={errors.name} />

          {(activeTab === 0 || activeTab === 4 || activeTab === 2 || activeTab === 3) && (
            <StyledTextField fullWidth label="Enter your mother name" variant="outlined" name="motherName" value={formData.motherName} onChange={handleInputChange} />
          )}

          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel>Gender*</InputLabel>
            <Select name="gender" value={formData.gender} onChange={handleSelectChange} label="Gender*">
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </Select>
            {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
          </FormControl>

          <StyledTextField fullWidth label="Enter Active Whatsapp Number*" type="number" variant="outlined" name="contact" value={formData.contact} onChange={handleInputChange} error={!!errors.contact} helperText={errors.contact} />

          <FormControl fullWidth error={!!errors.sect}>
            <InputLabel>Select Sect*</InputLabel>
            <Select
              name="sect"
              value={formData.sect}
              onChange={handleSelectChange}
              label="Select Sect*"
              onClose={() => setShowSunni(false)}
              renderValue={(selected) => selected}
            >
              <MenuItem value="Shia" onMouseEnter={() => setShowSunni(false)}>Shia</MenuItem>
              <ListSubheader
                onMouseEnter={() => setShowSunni(true)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  lineHeight: '1.5',
                  py: 1,
                  px: 2,
                  color: 'text.primary',
                  cursor: 'default',
                  opacity: 0.8
                }}
              >
                Sunni
                <Typography component="span" sx={{ ml: 1, fontSize: '0.85rem', fontStyle: 'italic', color: 'gray' }}>
                  (please choose from the list below)
                </Typography>
              </ListSubheader>
              <MenuItem value="Deobandi" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.sect) ? 'block' : 'none' }}>Deobandi</MenuItem>
              <MenuItem value="Barelvi" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.sect) ? 'block' : 'none' }}>Barelvi</MenuItem>
              <MenuItem value="Ahl-e-Hadith" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.sect) ? 'block' : 'none' }}>Ahl-e-Hadith</MenuItem>
            </Select>
            {errors.sect && <FormHelperText>{errors.sect}</FormHelperText>}
          </FormControl>

          {/* Show Parah & Ayat field for Quran O Hadith (tab 5), Special Occasion for Quran Khawani (tab 1), otherwise show Select Reason dropdown */}
          {activeTab === 5 ? (
            <StyledTextField
              fullWidth
              label="Para, Sura & Ayat*"
              variant="outlined"
              value={parahAyat}
              onChange={(e) => {
                setParahAyat(e.target.value);
                setErrors((prev) => ({ ...prev, parahAyat: undefined }));
              }}
              error={!!errors.parahAyat}
              helperText={errors.parahAyat}
              placeholder="e.g., Para 1, Surah Al-Fatiha, Ayat 1-7"
            />
          ) : activeTab === 1 ? (
            <StyledTextField
              fullWidth
              label="Special Occasion*"
              variant="outlined"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              error={!!errors.reason}
              helperText={errors.reason}
              placeholder="e.g., Wedding, Birthday, Death Anniversary"
            />
          ) : (
            <FormControl fullWidth error={!!errors.reason}>
              <InputLabel>Select Reason*</InputLabel>
              <Select name="reason" value={formData.reason} onChange={handleSelectChange} label="Select Reason*">
                <MenuItem value="Child related issue">Child related issue</MenuItem>
                <MenuItem value="Legitimate Rights">Legitimate Rights</MenuItem>
                <MenuItem value="Debt or Loans">Debt or Loans</MenuItem>
                <MenuItem value="Health issues">Health issues</MenuItem>
                <MenuItem value="Marriage or relationship">Marriage or relationship</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Job Problem">Job Problem</MenuItem>
                <MenuItem value="Domestic issues">Domestic issues</MenuItem>
                <MenuItem value="Pregnancy">Pregnancy</MenuItem>
                <MenuItem value="Jinn or Evil Eyes">Jinn or Evil Eyes</MenuItem>
              </Select>
              {errors.reason && <FormHelperText>{errors.reason}</FormHelperText>}
            </FormControl>
          )}

          {activeTab === 2 && (
            <FormControl fullWidth error={!!errors.selectWazifa}>
              <InputLabel>Select Wazifa*</InputLabel>
              <Select name="selectWazifa" value={formData.selectWazifa} onChange={handleSelectChange} label="Select Wazifa*">
                <MenuItem value="Wazifa 1">Wazifa 1</MenuItem>
                <MenuItem value="Wazifa 2">Wazifa 2</MenuItem>
                <MenuItem value="Wazifa 3">Wazifa 3</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.selectWazifa && <FormHelperText>{errors.selectWazifa}</FormHelperText>}
            </FormControl>
          )}

          {(activeTab === 0 || activeTab === 4 || activeTab === 5) && (
            <FormControl fullWidth>
              <InputLabel>Preferred Language (Optional)</InputLabel>
              <Select name="language" value={formData.language} onChange={handleSelectChange} label="Preferred Language">
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Urdu">Urdu</MenuItem>
                <MenuItem value="Punjabi">Punjabi</MenuItem>
                {/* <MenuItem value="Sindhi">Sindhi</MenuItem>
                <MenuItem value="Pashto">Pashto</MenuItem>
                <MenuItem value="Balochi">Balochi</MenuItem> */}
              </Select>
            </FormControl>
          )}

          {/* ===== QURAN KHAWANI SPECIFIC FIELDS ===== */}
          {activeTab === 1 && (
            <>
              {/* Date Picker - next 3 days disabled */}
              <FormControl fullWidth error={!!errors.quranKhawaniDate}>
                <StyledTextField
                  fullWidth
                  label="Select Date*"
                  type="date"
                  variant="outlined"
                  value={quranKhawaniDate}
                  onChange={(e) => {
                    setQuranKhawaniDate(e.target.value);
                    setErrors((prev) => ({ ...prev, quranKhawaniDate: undefined }));
                  }}
                  inputProps={{ min: getMinDate() }}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.quranKhawaniDate}
                  helperText={errors.quranKhawaniDate || "Available from 3 days onwards"}
                />
              </FormControl>

              {/* Time Slot Selector */}
              <FormControl fullWidth error={!!errors.quranKhawaniTimeSlot}>
                <InputLabel>Select Time Slot*</InputLabel>
                <Select
                  value={quranKhawaniTimeSlot}
                  onChange={(e) => {
                    setQuranKhawaniTimeSlot(e.target.value);
                    setErrors((prev) => ({ ...prev, quranKhawaniTimeSlot: undefined }));
                  }}
                  label="Select Time Slot*"
                >
                  <MenuItem value="Morning">🌅 Morning</MenuItem>
                  <MenuItem value="Afternoon">☀️ Afternoon</MenuItem>
                  <MenuItem value="Evening">🌙 Evening</MenuItem>
                </Select>
                {errors.quranKhawaniTimeSlot && <FormHelperText>{errors.quranKhawaniTimeSlot}</FormHelperText>}
              </FormControl>

              {/* Feature on Home Page checkbox with tooltip */}
              <Box sx={{ gridColumn: { sm: "1 / -1" }, display: "flex", alignItems: "center", gap: 1, px: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={featureOnHomePage}
                      onChange={(e) => setFeatureOnHomePage(e.target.checked)}
                      sx={{ color: "#F69320", "&.Mui-checked": { color: "#F69320" } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "black" }}>
                      Feature on Home Page
                    </Typography>
                  }
                />
                <Tooltip
                  title={FEATURE_TOOLTIP}
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#212121",
                        color: "#fff",
                        fontSize: "0.78rem",
                        maxWidth: 280,
                        p: 1.5,
                        borderRadius: 1.5,
                      },
                    },
                    arrow: { sx: { color: "#212121" } },
                  }}
                >
                  <HelpOutlineIcon
                    sx={{ fontSize: 18, color: "#757575", cursor: "pointer", "&:hover": { color: "#F69320" } }}
                  />
                </Tooltip>
              </Box>
            </>
          )}

          {selectedScholarId && activeTab !== 4 && (
            <StyledTextField disabled fullWidth label="Selected Scholar" variant="outlined" value={selectedScholarId.scholarName} />
          )}
        </Box>

        <Box sx={{ display: "flex", px: { xs: 2, sm: 5 }, mb: 2 }}>
          <StyledTextField fullWidth label={activeTab === 1 ? "Description of event and any special requests or instructions." : "Message if any (optional)"} variant="outlined" multiline rows={4} name="message" value={formData.message} onChange={handleInputChange} />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", mb: 2 }}>
          <VoiceNoteButton fullWidth onClick={handleRecordClick}>
            {recording ? `🛑 Stop Recording (${formatRecordingTime(recordingTime)} / 02:00)` : (activeTab === 1 ? "Add Voice Note (Optional)" : "Add/Record Voice Note*")}
          </VoiceNoteButton>
          <Typography variant="caption" sx={{ color: "#888", textAlign: "center", display: "block", mt: 0.5, mb: 1 }}>
            ⏱ Only 2 minutes of voice recording is allowed.
          </Typography>
          {errors.audio && (
            <Typography color="error" textAlign="center" variant="body2" sx={{ mb: 1 }}>{errors.audio}</Typography>
          )}

          {audioURL && (
            <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <audio
                controls
                src={audioURL}
                style={{ width: "100%" }}
                onLoadedMetadata={(e) => {
                  const el = e.currentTarget;
                  if (el.duration === Infinity || isNaN(el.duration)) {
                    el.currentTime = 1e8;
                    const resetTime = () => {
                      el.currentTime = 0;
                      el.removeEventListener('timeupdate', resetTime);
                    };
                    el.addEventListener('timeupdate', resetTime);
                  }
                }}
              />
              {audioDuration && (
                <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: "45px", color: "black" }}>
                  {audioDuration}
                </Typography>
              )}
              <IconButton onClick={() => { setAudioURL(null); setAudioBlob(null); setAudioDuration(null); setFormData(f => ({ ...f, audioUrl: "" })); }} sx={{ backgroundColor: "#ffebee", color: "#d32f2f", "&:hover": { backgroundColor: "#ffcdd2" } }}>
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {errors.scholar && (
            <Typography color="error" textAlign="center" sx={{ mb: 1 }}>{errors.scholar}</Typography>
          )}

          {activeTab !== 4 && activeTab !== 1 && (
            <StyledButton fullWidth onClick={() => setOpenDialog(true)}>
              Select Scholar
            </StyledButton>
          )}

          <Box sx={{ display: 'flex', gap: 2, width: '94%', margin: '0 auto 20px auto' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleSubmit(false)}
              disabled={submitting || isServiceDisabled}
              sx={{
                color: "#fff",
                transition: "all 0.3s ease-in-out",
                backgroundColor: "#F69320",
                "&:hover": { scale: 1.05 },
              }}
            >
              {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : (isEditMode ? 'Update Request' : 'Submit Request')}
            </Button>
            {isEditMode && (
              <Button
                fullWidth
                variant="outlined"
                onClick={onCancelEdit}
                sx={{
                  color: "#F69320",
                  borderColor: "#F69320",
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: "#fff",
                  "&:hover": { scale: 1.05, borderColor: "#F69320" },
                }}
              >
                Cancel
              </Button>
            )}
          </Box>

          {/* Signup Dialog */}
          <Dialog open={openSignUp} onClose={() => setOpenSignUp(false)} maxWidth="xs" fullWidth>
            <SignupForm onClose={() => setOpenSignUp(false)} onAuthSuccess={handleAuthSuccess} />
          </Dialog>

          {/* Scholar Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { width: "95%", height: "1000px", borderRadius: "16px", overflow: "hidden" } }}>
            <DialogTitle sx={{ m: 0, p: 2, backgroundColor: "#006c3b", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              Select Scholar
              <IconButton aria-label="close" onClick={() => setOpenDialog(false)} sx={{ color: "#fff" }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: "auto", height: "calc(1000px - 64px)" }}>
              <FindScholarPop onSelectScholar={handleScholarSelect} serviceFilter={activeTab === 0 ? "Dua" : activeTab === 1 ? "Quran" : activeTab === 2 ? "Tasb,Wazaif,Adhkar" : activeTab === 3 ? "Ist" : ""} />
            </DialogContent>
          </Dialog>

          {/* Standard Success Dialog (non-QK) */}
          <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)} PaperProps={{ sx: { padding: 3, borderRadius: 2, textAlign: "center" } }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Request added to cart successfully!</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>What do you want to do next?</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-around", gap: 2 }}>
              <StyledButton onClick={() => { navigate("/user/cart"); window.scrollTo(0, 0); }}>Go to Checkout</StyledButton>
              <StyledButton sx={{ backgroundColor: "#006c3b" }} onClick={() => { resetForm(); setOpenSuccessDialog(false); }}>Continue Booking</StyledButton>
            </Box>
          </Dialog>

          {/* Quran Khawani Success Dialog */}
          <Dialog
            open={openQKSuccessDialog}
            onClose={() => setOpenQKSuccessDialog(false)}
            PaperProps={{ sx: { padding: 3, borderRadius: 2, textAlign: "center", maxWidth: 420 } }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#006c3b", fontWeight: "bold" }}>
              🕌 Quran Khawani Booked!
            </Typography>
            <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.7 }}>
              Your request has been added to your cart successfully.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "#f0faf5",
                borderRadius: 1.5,
                border: "1px solid #a5d6b7",
                color: "#1b5e20",
                fontWeight: 500,
                lineHeight: 1.7,
              }}
            >
              📍 You will receive a live zoom meeting link for your Quran Khwani shortly.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-around", gap: 2 }}>
              <StyledButton onClick={() => { navigate("/user/cart"); window.scrollTo(0, 0); }}>Go to Checkout</StyledButton>
              <StyledButton sx={{ backgroundColor: "#006c3b" }} onClick={() => { resetForm(); setOpenQKSuccessDialog(false); }}>Continue Booking</StyledButton>
            </Box>
          </Dialog>

          {/* Recording Confirmation Dialog */}
          <Dialog
            open={openRecordingConfirmDialog}
            onClose={() => setOpenRecordingConfirmDialog(false)}
            PaperProps={{ sx: { padding: 3, borderRadius: 2, textAlign: "center", minWidth: "300px" } }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Confirm Submission
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to submit this voice note?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-around", gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  // No -> Review audio (close dialog)
                  setOpenRecordingConfirmDialog(false);
                }}
                sx={{ width: "45%" }}
              >
                No
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Yes -> Submit
                  setOpenRecordingConfirmDialog(false);
                  handleSubmit(true);
                }}
                sx={{ width: "45%", backgroundColor: "#F69320", color: "#fff" }}
              >
                Yes
              </Button>
            </Box>
          </Dialog>
        </Box>

        <Typography variant="body2" color="textSecondary" align="center" width="90%" margin="0 auto">
          Your information is safe with us. We do not spam. Do you want to make your service public or not?
        </Typography>

        <FeatureBox>
          <FeatureItem variant="body2">✅ Service Guarantee</FeatureItem>
          <FeatureItem variant="body2">✅ Fast Turnaround</FeatureItem>
          <FeatureItem variant="body2">✅ Regular Updates</FeatureItem>
        </FeatureBox>
      </Box>
    </MainContainer >
  );
};

export default BookYourSpirtualForm;