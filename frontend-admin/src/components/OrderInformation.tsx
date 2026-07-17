import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Slider,
  Dialog,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Mic,
  Stop,
  Close,
} from '@mui/icons-material';
import { getOrderById, updateOrder } from '../services/orderService';
import { Order } from '../types/order';
import { uploadAudio, getAllOrdersWithConversations } from '../services/userConversationService';
import { sendMessage } from '../services/messageService';
import { Message } from '../types/userConversation';


const OrderInformation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlertDialog();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scholarReply, setScholarReply] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState('00:00');
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  // Audio recording and file selection states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [scholarAudioUrl, setScholarAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [scholarID, setScholarID] = useState<string | null>(null);
  const [latestScholarMessage, setLatestScholarMessage] = useState<Message | null>(null);
  const [latestScholarMessageAudioDuration, setLatestScholarMessageAudioDuration] = useState('00:00');
  const [isPlayingLatestScholarMessageAudio, setIsPlayingLatestScholarMessageAudio] = useState(false);
  const [latestScholarMessageCurrentTime, setLatestScholarMessageCurrentTime] = useState(0);
  const [latestScholarMessageDurationSec, setLatestScholarMessageDurationSec] = useState(0);

  // Manual duration for recorded audio (since Blobs often don't show duration immediately)
  const [audioDurationString, setAudioDurationString] = useState('00:00');
  const [openRecordingConfirmDialog, setOpenRecordingConfirmDialog] = useState(false);
  const recordingStartTimeRef = useRef<number>(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const latestScholarMessageAudioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get audio URL from order - handle both audioUrl and AudioURL
  const getAudioUrl = (): string => {
    if (!order) return '';
    // Check for AudioURL (capital) first, then audioUrl (lowercase)
    const orderWithAudioURL = order as Order & { AudioURL?: string };
    return orderWithAudioURL.AudioURL || order.audioUrl || '';
  };

  const audioUrl = getAudioUrl();
  const hasAudio = Boolean(audioUrl && audioUrl.trim() !== '');

  const [latestAdminMessage, setLatestAdminMessage] = useState<Message | null>(null);

  // Fetch order data and conversation
  useEffect(() => {
    const fetchOrderAndConversation = async () => {
      if (!orderId) {
        setError('Order ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch order data
        const orderData = await getOrderById(orderId);

        // Check if order is already submitted or completed
        if (orderData.Status === 'Scholar Submitted – Pending Review' || orderData.Status === 'Completed') {
          setError('This request has already been completed or submitted for review. You cannot access this page anymore.');
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Extract ScholarID from order
        const orderWithScholarID = orderData as Order & { ScholarID?: string | { _id: string } };
        if (orderWithScholarID.ScholarID) {
          const scholarIdValue = typeof orderWithScholarID.ScholarID === 'string'
            ? orderWithScholarID.ScholarID
            : orderWithScholarID.ScholarID._id;
          setScholarID(scholarIdValue);
        }

        // Fetch conversations to find conversationId for this order
        try {
          const conversationsResponse = await getAllOrdersWithConversations();
          const matchingOrder = conversationsResponse.ordersWithConversations.find(
            (item) => item.order._id === orderId
          );
          if (matchingOrder) {
            setConversationId(matchingOrder.conversation._id);

            // Find latest scholar message
            if (matchingOrder.messages && matchingOrder.messages.length > 0) {
              const scholarMessages = matchingOrder.messages.filter(msg => msg.type === 'scholar');
              if (scholarMessages.length > 0) {
                const sortedScholarMessages = scholarMessages.sort((a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setLatestScholarMessage(sortedScholarMessages[sortedScholarMessages.length - 1]);
              }

              const adminMessages = matchingOrder.messages.filter(msg => msg.type === 'adminToScholar');
              if (adminMessages.length > 0) {
                const sortedAdminMessages = adminMessages.sort((a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setLatestAdminMessage(sortedAdminMessages[sortedAdminMessages.length - 1]);
              }
            }
          } else {
            console.warn('No conversation found for this order');
          }
        } catch (convErr) {
          console.error('Error fetching conversations:', convErr);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndConversation();
  }, [orderId]);

  // Initialize audio when audioUrl changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasAudio) {
      setAudioDuration('00:00');
      setCurrentTime(0);
      setDurationSec(0);
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    const currentSrc = audio.getAttribute('src') || audio.src;
    if (currentSrc !== audioUrl) {
      console.log('Setting audio src to:', audioUrl);
      setAudioDuration('00:00');
      setCurrentTime(0);
      setDurationSec(0);
      audio.src = audioUrl;
      audio.load();
    }

    const handleLoadedMetadata = () => {
      if (audio && audio.duration && isFinite(audio.duration)) {
        const duration = audio.duration;
        setDurationSec(duration);
        const minutes = Math.floor(duration / 60);
        const seconds = Math.round(duration % 60);
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setAudioDuration(formattedDuration);
      }
    };

    const handleError = () => {
      console.error('Audio error:', audio?.error);
      console.error('Audio URL that failed:', audioUrl);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleAudioEnded); // Add this line

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, hasAudio]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (audioRef.current) {
      const time = newValue as number;
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSeekScholarMessage = (_event: Event, newValue: number | number[]) => {
    if (latestScholarMessageAudioRef.current) {
      const time = newValue as number;
      latestScholarMessageAudioRef.current.currentTime = time;
      setLatestScholarMessageCurrentTime(time);
    }
  };

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

  // Track recording time
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
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
  }, [isRecording]);

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        await showAlert('Error', "Audio recording is not supported in this browser.", 'error');
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now(); // Track start time

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        setRecordedAudioBlob(audioBlob);
        setScholarAudioUrl(audioUrl);
        setSelectedAudioFile(null);

        // Calculate duration manually
        const durationSec = (Date.now() - recordingStartTimeRef.current) / 1000;
        const minutes = Math.floor(durationSec / 60);
        const seconds = Math.round(durationSec % 60);
        setAudioDurationString(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // 1000ms timeslice for Safari support
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      await showAlert('Error', 'Failed to access microphone. Please check your permissions.', 'error');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Remove audio (recorded or selected)
  const handleRemoveAudio = () => {
    // Cleanup URLs
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    if (scholarAudioUrl && (recordedAudio || selectedAudioFile)) {
      URL.revokeObjectURL(scholarAudioUrl);
    }

    // Reset states
    setRecordedAudio(null);
    setRecordedAudioBlob(null);
    setSelectedAudioFile(null);
    setScholarAudioUrl(null);
    setAudioDurationString("00:00");

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudio) {
        URL.revokeObjectURL(recordedAudio);
      }
      if (selectedAudioFile && scholarAudioUrl) {
        URL.revokeObjectURL(scholarAudioUrl);
      }
    };
  }, [recordedAudio, selectedAudioFile, scholarAudioUrl]);

  const handleForward = async (skipConfirmation = false) => {

    let activeBlob: Blob | null = null;

    // Check if we need confirmation for AUDIO (recorded or uploaded)
    // If currently recording: Stop -> Show Dialog
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setOpenRecordingConfirmDialog(true);
      return;
    }

    // If audio exists (recorded or file selected) and NOT confirmed
    const hasAudioContent = recordedAudioBlob || selectedAudioFile;
    if (hasAudioContent && !skipConfirmation) {
      setOpenRecordingConfirmDialog(true);
      return;
    }

    // Auto-stop logic removed/handled above.


    const hasText = scholarReply.trim().length > 0;
    const hasAudio = activeBlob || recordedAudioBlob || selectedAudioFile;

    // Ensure AUDIO is provided (mandatory)
    if (!hasAudio) {
      await showAlert('Info', 'Please record a voice note. Audio is mandatory.', 'info');
      return;
    }

    // Validate required fields
    if (!conversationId) {
      await showAlert('Error', 'Conversation ID is missing. Please refresh the page and try again.', 'error');
      return;
    }

    if (!scholarID) {
      await showAlert('Error', 'Scholar ID is missing. Please refresh the page and try again.', 'error');
      return;
    }

    try {
      setIsUploading(true);
      let uploadedAudioUrl: string | null = null;

      // Upload audio if present
      if (hasAudio) {
        try {
          const audioToUpload = activeBlob || recordedAudioBlob || selectedAudioFile;

          if (audioToUpload) {
            let fileToUpload: File;

            if (audioToUpload instanceof File) {
              fileToUpload = audioToUpload;
            } else {
              // Convert Blob to File with correct extension
              const mimeType = audioToUpload.type;
              const extension = mimeType.split("/")[1]?.split(";")[0] || "webm";
              fileToUpload = new File([audioToUpload], `scholar_reply_${Date.now()}.${extension}`, { type: mimeType });
            }

            const uploadResponse = await uploadAudio(fileToUpload);
            uploadedAudioUrl = uploadResponse.url;
          }
        } catch (error) {
          console.error('Error uploading audio:', error);
          await showAlert('Error', 'Failed to upload audio. Please try again.', 'error');
          setIsUploading(false);
          return;
        }
      }

      // Send message using message service
      try {
        await sendMessage({
          conversationId: conversationId,
          sender: scholarID,
          text: hasText ? scholarReply : undefined,
          audioUrl: uploadedAudioUrl || undefined,
          type: 'scholar',
        });

        // 🚀 Explicitly update order status
        if (orderId) {
          try {
            await updateOrder(orderId, { Status: "Scholar Submitted – Pending Review" });

          } catch (statusErr) {
            console.error("❌ Failed to explicitly update order status:", statusErr);
          }
        }

        // Show success message
        await showAlert('Success', 'Message sent successfully!', 'success');

        // Reset form after successful forward
        setScholarReply('');
        handleRemoveAudio();

        // Close the page after successful forward
        // Try to close the window if it was opened by a script (popup/new tab)
        // Otherwise, navigate back
        if (window.opener) {
          // Window was opened by a script, try to close it
          window.close();
        } else {
          // Navigate back or to a safe route
          try {
            // If history suggests we can go back, do so.
            // However, checking history length isn't always reliable for "can go back"
            // safe fallback: go to admin dashboard if -1 fails or if we want to be sure
            navigate(-1);
          } catch (e) {
            navigate('/admin/dashboard');
          }
        }
      } catch (error: unknown) {
        console.error('Error sending message:', error);
        const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send message. Please try again.';
        await showAlert('Error', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error in handleForward:', error);
      await showAlert('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Check if forward button should be enabled (audio mandatory, text optional)   
  const canForward = Boolean(recordedAudioBlob || selectedAudioFile);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '100%', md: '900px', lg: '900px' },
          margin: '0 auto',
          padding: { xs: 2, sm: 3, md: 3, lg: 4 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          boxSizing: 'border-box',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '100%', md: '900px', lg: '900px' },
          margin: '0 auto',
          padding: { xs: 2, sm: 3, md: 3, lg: 4 },
          boxSizing: 'border-box',
        }}
      >
        <Alert severity="error">{error || 'Order not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%', md: '900px', lg: '900px' },
        margin: '0 auto',
        padding: { xs: 2, sm: 3, md: 3, lg: 4 },
        backgroundColor: 'white',
        color: 'black',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          mb: 1,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
        }}
      >
        Request Information
      </Typography>

      {/* Instruction Text */}
      <Typography
        variant="body2"
        sx={{
          mb: 2,
          color: 'text.secondary',
          fontSize: { xs: '0.875rem', md: '1rem' },
        }}
      >
        Review the User request. Reply and determine if it's safe to send to the scholar.
      </Typography>

      {/* Rejection Message - Shown if status is Revision Requested By Admin */}
      {order.Status === 'Revision Requested By Admin' && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="error" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            <Typography variant="body1" paragraph>
              <strong>Rejection Message:</strong>
            </Typography>
            {latestAdminMessage && latestAdminMessage.text ? (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {latestAdminMessage.text.replace(/Please revise your response and resubmit using the link below:[\r\n\s]*\[View Order Details\]\(.*?\)/g, 'Please revise your response and resubmit.').trim()}
              </Typography>
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  Dear Scholar,
                </Typography>
                <Typography variant="body1" paragraph>
                  Your response for Request ID #{order.OrderID} has been rejected as it does not meet our quality standards or guidelines. Please review your response and ensure it addresses the user's query comprehensively and accurately.
                </Typography>
                <Typography variant="body1" gutterBottom fontWeight="bold">
                  Common reasons for rejection:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>
                    <Typography variant="body2">Incomplete answer or missing details.</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Lack of references from Quran and Sunnah (where applicable).</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Sharing contact details.</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">Missing detailed hidayah & guidance on Quran & Sunnah.</Typography>
                  </li>
                </ul>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Please revise your response and resubmit.
                </Typography>
              </>
            )}
          </Alert>
        </Box>
      )}

      {/* Divider */}
      <Divider sx={{ mb: 3 }} />

      {/* Order Details */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '1rem', md: '1.125rem' },
          }}
        >
          Request Details:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Request No:
            </Typography>
            <Typography component="span">#{order.OrderID || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Service:
            </Typography>
            <Typography component="span">{order.OrderTitle || 'N/A'}</Typography>
          </Box>

          {order.OrderTitle === "Wazaif and Adhkar" && (
            <Box>
              <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                Selected Wazifa:
              </Typography>
              <Typography component="span">{order.selectWazifa || 'N/A'}</Typography>
            </Box>
          )}

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Reason:
            </Typography>
            <Typography component="span">{order.Reason || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Sect:
            </Typography>
            <Typography component="span">{order.Sect || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Name:
            </Typography>
            <Typography component="span">{order.name || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Mother's Name:
            </Typography>
            <Typography component="span">{order.motherName || 'N/A'}</Typography>
          </Box>

          <Box>
            <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
              Preferred Language:
            </Typography>
            {/* Accessing with backend key 'PrefferedLanguage' (typo in DB) */}
            {/* @ts-ignore - Schema has typo */}
            <Typography component="span">{order.PrefferedLanguage || order.PreferredLanguage || 'N/A'}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Chat Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>

        {/* Scholar Message (Right Aligned) - Your Barakah */}
        {latestScholarMessage && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Box
              sx={{
                width: { xs: '95%', md: '70%' },
                p: 2,
                backgroundColor: '#e3f2fd',
                borderRadius: '20px 20px 0 20px',
                position: 'relative',
                boxShadow: 1,
                border: '1px solid #90caf9',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1565c0', textAlign: 'right' }}>
                Your Barakah (Scholar)
              </Typography>

              {/* Scholar Message Text */}
              {latestScholarMessage.text && (
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.05rem' },
                    color: 'rgba(0, 0, 0, 0.87)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    mb: latestScholarMessage.audioUrl ? 2 : 0,
                    textAlign: 'left',
                  }}
                >
                  {latestScholarMessage.text}
                </Typography>
              )}

              {/* Scholar Message Audio */}
              {latestScholarMessage.audioUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    border: '1px solid #bbdefb',
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    mt: 2,
                  }}
                >
                  <IconButton
                    onClick={async () => {
                      const audio = latestScholarMessageAudioRef.current;
                      if (!audio) return;
                      if (audio.paused) {
                        try {
                          await audio.play();
                          setIsPlayingLatestScholarMessageAudio(true);
                        } catch (e) {
                          console.error("Error playing scholar message audio", e);
                        }
                      } else {
                        audio.pause();
                        setIsPlayingLatestScholarMessageAudio(false);
                      }
                    }}
                    size="small"
                    sx={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      '&:hover': { backgroundColor: '#1565c0' },
                      width: 32, height: 32,
                    }}
                  >
                    {isPlayingLatestScholarMessageAudio ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                  </IconButton>

                  <Box sx={{ flex: 1 }}>
                    <Slider
                      aria-label="scholar-time-indicator"
                      size="small"
                      value={latestScholarMessageCurrentTime}
                      min={0}
                      step={0.1}
                      max={latestScholarMessageDurationSec}
                      onChange={handleSeekScholarMessage}
                      sx={{ color: '#1976d2', height: 4, '& .MuiSlider-thumb': { width: 12, height: 12 } }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'right' }}>
                    {latestScholarMessageAudioDuration}
                  </Typography>

                  <audio
                    ref={latestScholarMessageAudioRef}
                    src={latestScholarMessage.audioUrl}
                    onEnded={() => { setIsPlayingLatestScholarMessageAudio(false); setLatestScholarMessageCurrentTime(0); }}
                    onPlay={() => setIsPlayingLatestScholarMessageAudio(true)}
                    onPause={() => setIsPlayingLatestScholarMessageAudio(false)}
                    onTimeUpdate={(e) => setLatestScholarMessageCurrentTime(e.currentTarget.currentTime)}
                    onLoadedMetadata={() => {
                      const audio = latestScholarMessageAudioRef.current;
                      if (audio && audio.duration && isFinite(audio.duration)) {
                        const duration = audio.duration;
                        setLatestScholarMessageDurationSec(duration);
                        const minutes = Math.floor(duration / 60);
                        const seconds = Math.round(duration % 60);
                        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        setLatestScholarMessageAudioDuration(formattedDuration);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </Box>
              )}

              {/* Timestamp */}
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'right' }}>
                {new Date(latestScholarMessage.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* User Message (Left Aligned) */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <Box
            sx={{
              width: { xs: '95%', md: '70%' },
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: '20px 20px 20px 0',
              position: 'relative',
              boxShadow: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#555' }}>
              User Message
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.05rem' },
                color: 'rgba(0, 0, 0, 0.87)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textAlign: 'justify',
              }}
            >
              {order.message || ''}
            </Typography>

            {/* User Audio Player */}
            {hasAudio && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: '#ffffff',
                }}
              >
                <IconButton
                  onClick={handlePlayPause}
                  size="small"
                  sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': { backgroundColor: '#1565c0' },
                    width: 32, height: 32,
                  }}
                >
                  {isPlaying ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                </IconButton>

                <Box sx={{ flex: 1 }}>
                  <Slider
                    aria-label="time-indicator"
                    size="small"
                    value={currentTime}
                    min={0}
                    step={0.1}
                    max={durationSec}
                    onChange={handleSeek}
                    sx={{ color: '#1976d2', height: 4, '& .MuiSlider-thumb': { width: 12, height: 12 } }}
                  />
                </Box>
                <Typography variant="caption" sx={{ minWidth: 35, textAlign: 'right' }}>
                  {audioDuration}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>


      </Box>


      {/* Scholar's Reply Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '1rem', md: '1.125rem' },
          }}
        >
          Scholar's Reply
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Enter scholar's reply (Optional)..."
          value={scholarReply}
          onChange={(e) => setScholarReply(e.target.value)}
          sx={{
            '& .MuiInputBase-input': {
              fontSize: { xs: '0.875rem', md: '1rem' },
            },
          }}
        />

        {/* Audio Action Buttons - Next line, right aligned */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
            justifyContent: { md: 'flex-end' },
            alignItems: { xs: 'flex-end', sm: 'flex-end', md: 'center' },
            gap: 1,
            mt: 1,
          }}
        >
          {/* Record Audio Button */}
          <Button
            variant="contained"
            startIcon={isRecording ? <Stop /> : <Mic />}
            onClick={isRecording ? stopRecording : startRecording}
            sx={{
              backgroundColor: isRecording ? '#d32f2f' : '#1976d2',
              color: 'white',
              width: { xs: '100%', sm: '100%', md: 'auto' },
              minWidth: { xs: '100%', sm: '100%', md: 150 },
              '&:hover': {
                backgroundColor: isRecording ? '#c62828' : '#1565c0',
              },
            }}
          >
            {isRecording ? `Stop (${formatRecordingTime(recordingTime)})` : 'Record'}
          </Button>


        </Box>


        {/* Scholar Audio Player - Show if audio exists */}
        {(recordedAudio || selectedAudioFile) && scholarAudioUrl && (
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fafafa',
            }}
          >
            {/* Native Audio Player to handle Blobs correctly (Infinity duration issue) */}
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
              <audio
                controls
                src={scholarAudioUrl}
                style={{ width: '100%', height: 40 }}
                onLoadedMetadata={(e) => {
                  const audio = e.currentTarget;
                  if (audio.duration && isFinite(audio.duration)) {
                    // If browser gives us valid duration, use it
                    const minutes = Math.floor(audio.duration / 60);
                    const seconds = Math.round(audio.duration % 60);
                    setAudioDurationString(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                  }
                }}
              />
              <Typography variant="body2" sx={{ minWidth: 45, textAlign: "right" }}>
                {audioDurationString}
              </Typography>
            </Box>

            {/* Remove Audio Button */}
            <IconButton
              onClick={handleRemoveAudio}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        )}


      </Box>

      {/* Forward Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
        }}
      >
        <Button
          variant="contained"
          onClick={() => handleForward(false)}
          disabled={(!canForward && !isRecording) || isUploading}
          sx={{
            backgroundColor: canForward && !isUploading ? '#1976d2' : '#cccccc',
            color: 'white',
            px: 4,
            py: 1.5,
            fontSize: { xs: '0.875rem', md: '1rem' },
            fontWeight: 'bold',
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: canForward && !isUploading ? '#1565c0' : '#cccccc',
            },
            '&:disabled': {
              color: 'white',
            },
          }}
        >
          {isUploading ? 'Uploading...' : 'Forward'}
        </Button>
      </Box>

      {/* Hidden Audio Element - Always render to keep ref available */}
      <audio
        ref={audioRef}
        src={hasAudio ? audioUrl : undefined}
        onEnded={handleAudioEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && audio.duration && isFinite(audio.duration)) {
            const duration = audio.duration;
            setDurationSec(duration);
            const minutes = Math.floor(duration / 60);
            const seconds = Math.round(duration % 60);
            const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setAudioDuration(formattedDuration);
          }
        }}
        preload="metadata"
        style={{ display: 'none' }}
      />

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
              handleForward(true);
            }}
            sx={{ width: "45%", backgroundColor: "#F69320", color: "#fff" }}
          >
            Yes
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default OrderInformation;
