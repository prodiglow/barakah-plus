import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useAlertDialog } from "../../context/AlertDialogContext";
import { toast } from "react-toastify";
import { getUser, updateUser } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp } from "../../services/emailService";
import {
  getPublicIdFromUrl,
  uploadToCloudinary,
  deleteFromCloudinary
} from "../../services/CloudinaryService";
import { AxiosError } from "axios";


const UserSettings: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const [user, setUser] = useState<{
    _id?: string;
    name: string;
    email: string;
    profilePic?: string;
    phone: string;
  }>({
    name: "",
    email: "",
    phone: "",
    profilePic: "",
  });

  const [originalUser, setOriginalUser] = useState({
    email: "",
    phone: "",
  });

  // Verification states
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Countdown and Persistent Verification states
  const [phoneCountdown, setPhoneCountdown] = useState<number>(0);
  const [emailCountdown, setEmailCountdown] = useState<number>(0);
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

  const phoneOtpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const emailOtpRefs = React.useRef<(HTMLInputElement | null)[]>([]);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await getUser(token);
        setUser({
          _id: res._id,
          name: res.name,
          email: res.email,
          phone: res.phone || "",
          profilePic: res.profilePic,
        });
        setOriginalUser({
          email: res.email,
          phone: res.phone || "",
        });
        setVerifiedPhone(res.phone || "");
        setVerifiedEmail(res.email);
        setIsPhoneVerified(true);
        setIsEmailVerified(true);
        setPreviewUrl(res.profilePic);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
        toast.error("Failed to load user profile ❌");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phoneCountdown > 0) {
      timer = setInterval(() => {
        setPhoneCountdown((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (emailCountdown > 0) {
      timer = setInterval(() => {
        setEmailCountdown((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  useEffect(() => {
    if (phoneOtpSent && phoneOtpRefs.current[0]) {
      phoneOtpRefs.current[0]?.focus();
    }
  }, [phoneOtpSent]);

  useEffect(() => {
    if (emailOtpSent && emailOtpRefs.current[0]) {
      emailOtpRefs.current[0]?.focus();
    }
  }, [emailOtpSent]);


  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    if (name === "email" || name === "phone") {
      if (name === "phone") {
        if (value === originalUser.phone || (value === verifiedPhone && verifiedPhone !== "")) {
          setIsPhoneVerified(true);
        } else {
          setIsPhoneVerified(false);
          setPhoneOtpSent(false);
          setPhoneCountdown(0);
        }
      } else if (name === "email") {
        if (value === originalUser.email || (value === verifiedEmail && verifiedEmail !== "")) {
          setIsEmailVerified(true);
        } else {
          setIsEmailVerified(false);
          setEmailOtpSent(false);
          setEmailCountdown(0);
        }
      }
    }
  };


  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleSendPhoneOtp = async () => {
    if (!user.phone) {
      toast.error("Please enter phone number");
      return;
    }
    try {
      const res = await sendPhoneOtp(user.phone);
      setPhoneOtpSent(true);
      setPhoneCountdown(60);
      await showAlert('Info', `Your OTP for phone verification is: ${res.otp}`, 'info');
      toast.success("OTP sent to your phone");
    } catch (err) {
      toast.error("Failed to send phone OTP");
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    try {
      const res = await verifyPhoneOtp(user.phone, phoneOtp);
      if (res.success) {
        setIsPhoneVerified(true);
        setVerifiedPhone(user.phone);
        setPhoneOtpSent(false);
        toast.success("Phone verified successfully!");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleSendEmailOtp = async () => {
    if (!user.email) {
      toast.error("Please enter email");
      return;
    }
    try {
      await sendOtp(user.email);
      setEmailOtpSent(true);
      setEmailCountdown(60);
      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error("Failed to send email OTP");
    }
  };

  const handleVerifyEmail = async () => {
    if (emailOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    try {
      const res = await verifyOtp(user.email, emailOtp);
      if (res.success) {
        setIsEmailVerified(true);
        setVerifiedEmail(user.email);
        setEmailOtpSent(false);
        toast.success("Email verified successfully!");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem("token");
    const userId = user._id || localStorage.getItem("userId");

    if (!token || !userId) {
      toast.error("User ID or token missing ❌");
      return;
    }

    if (!isPhoneVerified) {
      toast.error("Please verify your phone number ❌");
      return;
    }

    try {
      setLoading(true);
      let updatedProfilePic = user.profilePic;

      if (selectedFile && user.profilePic) {
        const publicId = getPublicIdFromUrl(user.profilePic);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId, token);
          } catch (err) {
            console.error("❌ Failed to delete old image:", err);
          }
        }
      }

      if (selectedFile) {
        setUploading(true);
        updatedProfilePic = await uploadToCloudinary(selectedFile, token);
        setUploading(false);
      }

      await updateUser(userId, token, {
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: updatedProfilePic,
      });

      setUser((prev) => ({ ...prev, profilePic: updatedProfilePic }));
      setOriginalUser({
        email: user.email,
        phone: user.phone,
      });
      setSelectedFile(null);
      setPreviewUrl(updatedProfilePic);

      toast.success("Profile updated successfully 🎉");
      navigate("/home-baraka");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; fields?: { email: boolean; phone: boolean } }>;
      const errorData = error.response?.data;
      if (errorData?.fields) {
        toast.error(errorData.message || "Value already in use");
      } else {
        toast.error("Failed to update profile ❌");
      }
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const OTPInput = (
    otpValue: string,
    setOtpValue: (val: string) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onVerify: () => void
  ) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" mb={1} textAlign="center">Enter OTP</Typography>
      <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mb: 2 }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <TextField
            key={index}
            inputRef={(el) => (refs.current[index] = el)}
            value={otpValue[index] || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (!/^\d*$/.test(val)) return;

              const newOtp = otpValue.split("");
              newOtp[index] = val.slice(-1);
              const newOtpStr = newOtp.join("");
              setOtpValue(newOtpStr);

              if (val && index < 5) {
                refs.current[index + 1]?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !otpValue[index] && index > 0) {
                refs.current[index - 1]?.focus();
              }
            }}
            inputProps={{
              maxLength: 1,
              style: { textAlign: "center", fontSize: "1rem", padding: "8px" }
            }}
            sx={{ width: 40 }}
          />
        ))}
      </Box>
      <Button fullWidth variant="outlined" onClick={onVerify} size="small" sx={{ mb: 1 }}>
        Verify
      </Button>
    </Box>
  );


  return (
    <Box
      sx={{
        mt: { xs: 10, sm: 10 },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        width: "90%",
        margin: "0 auto",
        backgroundColor: "white",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 700,
          borderRadius: 3,
          boxShadow: "0px 8px 25px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={3} textAlign="center">
          User Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }} textAlign="center">
            <Avatar
              src={previewUrl || "/default-user.png"}
              alt={user.name}
              sx={{
                width: 100,
                height: 100,
                mx: "auto",
                mb: 2,
                border: "2px solid #4CAF50",
              }}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{
                textTransform: "none",
                borderColor: "#4CAF50",
                color: "#4CAF50",
              }}
            >
              {uploading ? <CircularProgress size={20} /> : "Change Picture"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }} >
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={user.name}
              onChange={handleChange}
              variant="outlined"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Phone (Verfication Mandatory if changed)"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: isPhoneVerified && (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
              {!isPhoneVerified && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleSendPhoneOtp}
                  disabled={phoneCountdown > 0}
                  sx={{ mt: 1 }}
                >
                  {phoneCountdown > 0
                    ? `Resend in ${phoneCountdown}s`
                    : (phoneOtpSent ? "Resend OTP" : "Verify Phone")
                  }
                </Button>
              )}
              {phoneOtpSent && !isPhoneVerified && OTPInput(phoneOtp, setPhoneOtp, phoneOtpRefs, handleVerifyPhone)}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email (Optional Verification)"
                name="email"
                value={user.email}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: isEmailVerified && (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
              {!isEmailVerified && (
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleSendEmailOtp}
                  disabled={emailCountdown > 0}
                  sx={{ mt: 1 }}
                >
                  {emailCountdown > 0
                    ? `Resend in ${emailCountdown}s`
                    : (emailOtpSent ? "Resend OTP" : "Verify Email")
                  }
                </Button>
              )}
              {emailOtpSent && !isEmailVerified && OTPInput(emailOtp, setEmailOtp, emailOtpRefs, handleVerifyEmail)}
            </Box>
          </Grid>


          <Grid size={{ xs: 12 }} textAlign="center">
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
              sx={{
                background: "linear-gradient(90deg, #1db954, #11998e)",
                px: 5,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
              }}
              disabled={loading || uploading}
            >
              {loading || uploading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserSettings;
