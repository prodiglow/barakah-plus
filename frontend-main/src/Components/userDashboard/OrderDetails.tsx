import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { useAlertDialog } from "../../context/AlertDialogContext";
import { getOrderById, updateOrder } from "../../services/orderService";
import { Order } from "../../types/order";
import { uploadAudioToCloudinary } from "../../services/CloudinaryAudioService";
import { getUserChat } from "../../services/userConversationService";
import { sendMessage } from "../../services/messageService";

const StyledHeader = styled(Typography)({
  backgroundColor: "white",
  color: "black",
  padding: "10px 40px",
  textAlign: "left",
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
    "& fieldset": {
      borderColor: "#757575",
    },
    "&:hover fieldset": {
      borderColor: "#424242",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
  },
  backgroundColor: "#fff",
});

const StyledButton = styled(Button)({
  color: "#fff",
  display: "flex",
  marginBottom: "20px",
  margin: "0 auto 20px auto",
  width: "94%",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    scale: 1.05,
  },
  backgroundColor: "#F69320",
});

const VoiceNoteButton = styled(Button)({
  color: "#F69320",
  padding: "10px",
  display: "flex",
  width: "100%",
  margin: "0 auto 20px auto",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    scale: 1.05,
  },
  backgroundColor: "#fff",
  border: "2px solid #F69320",
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
  "& .MuiSvgIcon-root": {
    marginRight: "5px",
  },
  backgroundColor: "#fff",
});

// Helper Function for MIME type
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


const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertDialog();
  const location = useLocation();
  const isEditable = location.state?.isEditable || false;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    name: "",
    motherName: "",
    gender: "",
    phone: "",
    Sect: "",
    Reason: "",
    PrefferedLanguage: "",
    message: "",
    selectWazifa: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    motherName: "",
    gender: "",
    phone: "",
    Sect: "",
    Reason: "",
    PrefferedLanguage: "",
    message: "",
    selectWazifa: "",
  });

  const [showSunni, setShowSunni] = useState(false);

  // Audio recorder states
  const [recording, setRecording] = useState(false);
  const [recordedAudioURL, setRecordedAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_RECORDING_SECONDS = 120; // 2 minutes

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrderById(id);
        // Handle both direct order and wrapped response
        const orderData = response.order || response;

        // Normalize AudioURL field (handle case sensitivity)
        const orderDataWithAudio = orderData as Order & { audioURL?: string; audioUrl?: string };
        const normalizedOrder = {
          ...orderData,
          AudioURL: orderData.AudioURL || orderDataWithAudio.audioURL || orderDataWithAudio.audioUrl || undefined
        };

        setOrder(normalizedOrder);

        // Debug: Log audio URL to check if it exists


        // Populate form with order data
        const initialData = {
          name: orderData.name || "",
          motherName: orderData.motherName || "",
          gender: orderData.gender || "",
          phone: orderData.phone || "",
          Sect: orderData.Sect || "",
          Reason: orderData.Reason || "",
          PrefferedLanguage: orderData.PrefferedLanguage || "",
          message: orderData.message || "",
          selectWazifa: orderData.selectWazifa || "",
        };
        setFormData(initialData);
        setInitialFormData(initialData);

        // Fetch conversation for this order
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const chatResponse = await getUserChat(id, userId);
            if (chatResponse.conversation?._id) {
              setConversationId(chatResponse.conversation._id);
            }
          }
        } catch (convErr) {
          console.error("Error fetching conversation:", convErr);
          // Don't fail the whole page if conversation fetch fails
        }
      } catch (err) {
        setError("Failed to load order details.");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Debug: Monitor order state changes, especially AudioURL
  useEffect(() => {
    if (order) {
      // console.log("Order state updated:", {
      //   orderId: order.OrderID || order._id,
      //   hasAudioURL: !!order.AudioURL,
      //   audioURL: order.AudioURL,
      //   audioURLType: typeof order.AudioURL
      // });
    }
  }, [order]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Track changes - button enabled only when message is edited or new audio is recorded
  useEffect(() => {
    const messageChanged = formData.message !== initialFormData.message;
    const hasNewAudio = recordedAudioURL !== null;

    setHasChanges(messageChanged || hasNewAudio);
  }, [formData.message, initialFormData.message, recordedAudioURL]);

  // Auto-stop recording at 2 minutes
  useEffect(() => {
    if (recording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            // Auto-stop at 2 minutes
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              mediaRecorderRef.current.stop();
            }
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
        streamRef.current = stream;

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
          const audioBlob = new Blob(audioChunks.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioURL(url);
          setHasChanges(true);

          // Stop all tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
        };

        mediaRecorder.start(1000); // 1000ms timeslice
        setRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        await showAlert('Error', "Please allow microphone access to record audio!", 'error');
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setRecording(false);
    }
  };

  const handleRemoveAudio = () => {
    // Clean up recorded audio
    if (recordedAudioURL) {
      URL.revokeObjectURL(recordedAudioURL);
      setRecordedAudioURL(null);
      setHasChanges(true);
    }
    // Clean up existing order audio (we'll update the order state)
    if (order) {
      setOrder({ ...order, AudioURL: undefined });
      setHasChanges(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedAudioURL) {
        URL.revokeObjectURL(recordedAudioURL);
      }
    };
  }, [recordedAudioURL]);

  const handleConfirmChanges = async (skipConfirmation = false) => {
    if (!id || !order) {
      setUpdateError("Order ID or order data is missing");
      return;
    }

    // Show confirmation dialog if there are changes and not skipping confirmation
    if (hasChanges && !skipConfirmation) {
      setOpenConfirmDialog(true);
      return;
    }

    // Auto-stop recording if active
    let wasRecording = false;
    if (recording && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      wasRecording = true;
      try {
        await new Promise<void>((resolve) => {
          const recorder = mediaRecorderRef.current!;
          recorder.addEventListener("stop", () => {
            setRecording(false);
            resolve();
          }, { once: true });
          recorder.stop();
        });
      } catch (err) {
        console.error("Error stopping recording:", err);
      }
    }

    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      let audioURL = order.AudioURL;

      // Upload new audio if recorded
      if ((recordedAudioURL || wasRecording) && audioChunks.current.length > 0) {
        try {
          const mimeType = getSupportedMimeType();
          const extension = mimeType.split("/")[1]?.split(";")[0] || "webm";

          const blob = new Blob(audioChunks.current, { type: mimeType });
          const file = new File([blob], `voice_note.${extension}`, { type: mimeType });
          const token = localStorage.getItem("token") || "";

          const cloudinaryResponse = await uploadAudioToCloudinary(file, token);
          audioURL = cloudinaryResponse.url;

        } catch (audioErr) {
          console.error("❌ Failed to upload audio:", audioErr);
          setUpdateError("Failed to upload audio. Please try again.");
          setUpdating(false);
          return;
        }
      }

      // Prepare update data
      const updateData: Partial<Order> = {
        name: formData.name,
        motherName: formData.motherName || undefined,
        gender: formData.gender,
        phone: formData.phone,
        Sect: formData.Sect,
        Reason: formData.Reason,
        PrefferedLanguage: formData.PrefferedLanguage || undefined,
        message: formData.message || undefined,
        selectWazifa: formData.selectWazifa || undefined,
        AudioURL: audioURL || undefined,
        Status: "Pending Admin Review", // ✅ Reset status to Pending Admin Review so it shows in Admin Dashboard badges
      };

      if (order.OrderAmt === 0 || order.OrderAmt === null || order.OrderAmt === undefined) {
        updateData.ScholarID = ["Sunni", "Deobandi", "Barelvi", "Ahl-e-Hadith"].includes(formData.Sect)
          ? "68f0a62920f6d6ea28513c37"
          : formData.Sect === "Shia"
            ? "68f096b14829b2ccef2c6e3e"
            : order.ScholarID;
      }

      // Update the order
      const response = await updateOrder(id, updateData);


      // Send message to conversation if conversationId exists
      if (conversationId) {
        try {
          const userId = localStorage.getItem("userId");
          if (userId) {
            await sendMessage({
              conversationId: conversationId,
              sender: userId,
              text: formData.message || "",
              audioUrl: audioURL || undefined,
              type: "user",
            });
            console.log("✅ Message sent to conversation successfully");
          }
        } catch (messageErr) {
          console.error("❌ Error sending message to conversation:", messageErr);
          // Don't fail the whole update if message sending fails
        }
      }

      // Update local state
      if (response.order) {
        setOrder(response.order);
      } else {
        // Refresh order data
        const updatedOrder = await getOrderById(id);
        const orderData = updatedOrder.order || updatedOrder;
        setOrder(orderData);
      }

      // Clear recorded audio state
      if (recordedAudioURL) {
        URL.revokeObjectURL(recordedAudioURL);
        setRecordedAudioURL(null);
        audioChunks.current = [];
      }

      // Reset changes tracking
      setHasChanges(false);
      setInitialFormData({
        name: formData.name,
        motherName: formData.motherName,
        gender: formData.gender,
        phone: formData.phone,
        Sect: formData.Sect,
        Reason: formData.Reason,
        PrefferedLanguage: formData.PrefferedLanguage,
        message: formData.message,
        selectWazifa: formData.selectWazifa,
      });

      setUpdateSuccess(true);

      // Scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Navigate back to all orders after 1.5 seconds
      setTimeout(() => {
        navigate("/user/dashboard/orders");
      }, 1500);

    } catch (err: unknown) {
      console.error("❌ Error updating order:", err);
      let errorMessage = "Failed to update order. Please try again.";

      if (err && typeof err === "object") {
        if ("response" in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        } else if ("message" in err) {
          errorMessage = (err as { message: string }).message;
        }
      }

      setUpdateError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "95%", mx: "auto", mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ width: "95%", mx: "auto", mt: 3 }}>
        <Alert severity="warning">Order not found.</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "95%",
          mx: "auto",
        }}
      >
        <Typography
          variant="body1"
          sx={{ mt: 1, fontWeight: "bold", color: "lightgray" }}
        >
          Order #{order.OrderID || order._id} &nbsp; - &nbsp;
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, fontWeight: "bold" }}>
          Order Detail Page
        </Typography>
      </Box>
      <MainContainer>
        <StyledHeader variant="h4" fontWeight={700}>Order Details</StyledHeader>

        <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
          {/* 🟩 FIRST 7 FIELDS — using grid for perfect layout */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr", // 2 per row on sm+
              },
              gap: "15px",
              px: { xs: 2, sm: 5 },
              mb: 3,
            }}
          >
            {/* Name */}
            <StyledTextField
              fullWidth
              label="Enter your name*"
              variant="outlined"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={!isEditable}
            />

            {/* Mother Name */}
            <StyledTextField
              fullWidth
              label="Enter your mother name"
              variant="outlined"
              value={formData.motherName}
              onChange={(e) => handleInputChange("motherName", e.target.value)}
              disabled={!isEditable}
            />

            {/* Gender */}
            <StyledTextField
              fullWidth
              label="Gender*"
              variant="outlined"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              disabled={!isEditable}
            />

            {/* Contact */}
            <StyledTextField
              fullWidth
              label="Enter contact no*"
              variant="outlined"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={!isEditable}
            />

            {/* Sect */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Sect*</InputLabel>
              <Select
                label="Select Sect"
                value={formData.Sect}
                onChange={(e) => handleInputChange("Sect", e.target.value)}
                disabled={!isEditable}
                onClose={() => setShowSunni(false)}
                renderValue={(selected) => selected}
              >
                <MenuItem value="Shia" onMouseEnter={() => setShowSunni(false)}>Shia</MenuItem>
                <MenuItem value="Sunni" onMouseEnter={() => setShowSunni(true)}>Sunni</MenuItem>
                <MenuItem value="Deobandi" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.Sect) ? 'block' : 'none' }}>Deobandi</MenuItem>
                <MenuItem value="Barelvi" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.Sect) ? 'block' : 'none' }}>Barelvi</MenuItem>
                <MenuItem value="Ahl-e-Hadith" sx={{ pl: 4, display: showSunni || ['Deobandi', 'Barelvi', 'Ahl-e-Hadith'].includes(formData.Sect) ? 'block' : 'none' }}>Ahl-e-Hadith</MenuItem>
              </Select>
            </FormControl>

            {/* Reason */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Reason</InputLabel>
              <Select
                label="Select Reason"
                value={formData.Reason}
                onChange={(e) => handleInputChange("Reason", e.target.value)}
                displayEmpty
                disabled={!isEditable}
              >
                {formData.Reason && ![
                  "Child related issue",
                  "Legitimate Rights",
                  "Debt or Loans",
                  "Health issues",
                  "Jinn or Evil Eyes",
                  "Marriage or relationship",
                  "Education",
                  "Property",
                  "Job Problem",
                  "Domestic issues",
                  "Pregnancy"
                ].includes(formData.Reason) && (
                    <MenuItem value={formData.Reason}>{formData.Reason}</MenuItem>
                  )}
                <MenuItem value="Child related issue">Child related issue</MenuItem>
                <MenuItem value="Legitimate Rights">Legitimate Rights</MenuItem>
                <MenuItem value="Debt or Loans">Debt or Loans</MenuItem>
                <MenuItem value="Health issues">Health issues</MenuItem>
                <MenuItem value="Jinn or Evil Eyes">Jinn or Evil Eyes</MenuItem>
                <MenuItem value="Marriage or relationship">Marriage or relationship</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Property">Property</MenuItem>
                <MenuItem value="Job Problem">Job Problem</MenuItem>
                <MenuItem value="Domestic issues">Domestic issues</MenuItem>
                <MenuItem value="Pregnancy">Pregnancy</MenuItem>
              </Select>
            </FormControl>

            {/* Select Wazifa */}
            {order.OrderTitle === "Wazaif and Adhkar" && (
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select Wazifa*</InputLabel>
                <Select
                  label="Select Wazifa*"
                  value={formData.selectWazifa}
                  onChange={(e) => handleInputChange("selectWazifa", e.target.value)}
                  disabled={!isEditable}
                >
                  <MenuItem value="Wazifa 1">Wazifa 1</MenuItem>
                  <MenuItem value="Wazifa 2">Wazifa 2</MenuItem>
                  <MenuItem value="Wazifa 3">Wazifa 3</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Language */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Preferred Language (Optional)</InputLabel>
              <Select
                label="Preferred Language"
                value={formData.PrefferedLanguage}
                onChange={(e) => handleInputChange("PrefferedLanguage", e.target.value)}
                disabled={!isEditable}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Urdu">Urdu</MenuItem>
                <MenuItem value="Punjabi">Punjabi</MenuItem>
                <MenuItem value="Sindhi">Sindhi</MenuItem>
                <MenuItem value="Pashto">Pashto</MenuItem>
                <MenuItem value="Balochi">Balochi</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* 🟨 Message Field */}
          <Box
            sx={{
              display: "flex",
              px: { xs: 2, sm: 5 },
              mb: 2,
            }}
          >
            <StyledTextField
              fullWidth
              label="Message if any (optional)"
              variant="outlined"
              multiline
              rows={4}
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              disabled={!isEditable}
            />
          </Box>

          {/* 🟧 Voice Note */}
          <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
            <VoiceNoteButton
              fullWidth
              onClick={handleRecordClick}
              disabled={!isEditable}
              sx={{
                backgroundColor: recording ? "#ff4444" : "#fff",
                color: recording ? "#fff" : "#F69320",
                "&:hover": {
                  backgroundColor: recording ? "#cc0000" : "#fff",
                }
              }}
            >
              <svg
                width="17"
                height="23"
                viewBox="0 0 17 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5.44995C12 3.51695 10.433 1.94995 8.5 1.94995C6.567 1.94995 5 3.51695 5 5.44995V11.95C5 13.8829 6.567 15.45 8.5 15.45C10.433 15.45 12 13.8829 12 11.95V5.44995Z"
                  fill={recording ? "#fff" : "#F18912"}
                  stroke={recording ? "#fff" : "#F18912"}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M1 11.45C1 15.592 4.358 18.95 8.5 18.95M8.5 18.95C12.642 18.95 16 15.592 16 11.45M8.5 18.95V21.95"
                  stroke={recording ? "#fff" : "#F18912"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              &nbsp; {recording ? `🛑 Stop Recording (${formatRecordingTime(recordingTime)} / 02:00)` : "Add New Voice Note (Highly Recommended)"}
            </VoiceNoteButton>
            <Typography variant="caption" sx={{ color: "#888", textAlign: "center", display: "block", mt: 0.5 }}>
              ⏱ Only 2 minutes of voice recording is allowed.
            </Typography>

            {/* Audio Player - Show existing audio from database, or new recording if available */}
            {(() => {
              // Determine which audio to show: new recording takes priority, otherwise show existing from database
              // Handle case sensitivity - check both AudioURL and audioURL
              const orderWithAudio = order as Order & { audioURL?: string; audioUrl?: string };
              const existingAudioURL = order?.AudioURL || orderWithAudio?.audioURL || orderWithAudio?.audioUrl;
              const audioToShow = recordedAudioURL || existingAudioURL;

              // Check if we have a valid audio URL (not null, undefined, or empty string)
              const hasAudio = audioToShow &&
                typeof audioToShow === 'string' &&
                audioToShow.trim() !== "" &&
                audioToShow !== "null" &&
                audioToShow !== "undefined";

              return hasAudio ? (
                <Box
                  sx={{
                    mt: 2,
                    textAlign: "center",
                    position: "relative",
                    p: 1,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <audio
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "100%",
                      flex: 1,
                    }}
                    src={audioToShow}
                    key={audioToShow}
                  />
                  {isEditable && (
                    <IconButton
                      size="small"
                      onClick={handleRemoveAudio}
                      sx={{
                        color: "#ff4444",
                        flexShrink: 0,
                        "&:hover": {
                          backgroundColor: "#ffebee",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ) : null;
            })()}
          </Box>

          {/* Success/Error Messages */}
          {updateSuccess && (
            <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
              <Alert severity="success">Order updated successfully!</Alert>
            </Box>
          )}
          {updateError && (
            <Box sx={{ px: { xs: 2, sm: 5 }, mb: 2 }}>
              <Alert severity="error">{updateError}</Alert>
            </Box>
          )}

          {/* 🟩 Submit Button */}
          {isEditable && (
            <StyledButton
              fullWidth
              variant="contained"
              onClick={() => handleConfirmChanges(false)}
              disabled={updating || !hasChanges}
            >
              {updating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                  Updating...
                </>
              ) : (
                "Confirm Changes"
              )}
            </StyledButton>
          )}

          {/* Confirmation Dialog - Same as BookYourSpirtualForm */}
          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
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
                  setOpenConfirmDialog(false);
                }}
                sx={{ width: "45%" }}
              >
                No
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenConfirmDialog(false);
                  handleConfirmChanges(true);
                }}
                sx={{ width: "45%", backgroundColor: "#F69320", color: "#fff" }}
              >
                Yes
              </Button>
            </Box>
          </Dialog>

          {/* 🟦 Footer Text */}
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ backgroundColor: "#fff" }}
            width="90%"
            margin="0 auto"
          >
            Your information is safe with us. We do not spam. Do you want to make
            your service public or not?
          </Typography>

          {/* 🟪 Features */}
          <FeatureBox>
            <FeatureItem variant="body2">✅ Service Guarantee</FeatureItem>
            <FeatureItem variant="body2">✅ Fast Turnaround</FeatureItem>
            <FeatureItem variant="body2">✅ Regular Updates</FeatureItem>
          </FeatureBox>
        </Box>
      </MainContainer>
    </>

  );
};


export default OrderDetails;
