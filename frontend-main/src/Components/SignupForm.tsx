import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Paper,
  IconButton,
  Avatar,
  Badge,
  InputAdornment,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
} from "@mui/material";

import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { signupUser, loginUser, checkUserExists, forgotPassword } from "../services/authService";
import { uploadToCloudinary } from "../services/CloudinaryService";
import { sendOtp, verifyOtp, sendPhoneOtp, verifyPhoneOtp } from "../services/emailService";
import { AxiosError } from "axios";
import { authEvents } from "../utils/authEvents";

interface SignupFormProps {
  onClose?: () => void;
  onAuthSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onClose, onAuthSuccess }) => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // New state
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [step, setStep] = useState(1); // 1: Initial details, 2: Verification
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    phone: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");


  // Phone verification state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Email verification state
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

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneCountdown > 0) {
      timer = setInterval(() => {
        setPhoneCountdown((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCountdown]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailCountdown > 0) {
      timer = setInterval(() => {
        setEmailCountdown((prev: number) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  React.useEffect(() => {


    if (phoneOtpSent && phoneOtpRefs.current[0]) {
      phoneOtpRefs.current[0]?.focus();
    }
  }, [phoneOtpSent]);

  React.useEffect(() => {
    if (emailOtpSent && emailOtpRefs.current[0]) {
      emailOtpRefs.current[0]?.focus();
    }
  }, [emailOtpSent]);

  const handleToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsSignup((prev) => !prev);
    setStep(1);
    resetVerification();
  };

  const resetVerification = () => {
    setPhoneOtpSent(false);
    setPhoneOtp("");
    setIsPhoneVerified(false);
    setEmailOtpSent(false);
    setEmailOtp("");
    setIsEmailVerified(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error and handle verification restoration when user types
    if (name === "email" || name === "phone") {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      if (name === "phone") {
        if (value === verifiedPhone && verifiedPhone !== "") {
          setIsPhoneVerified(true);
        } else {
          setIsPhoneVerified(false);
          setPhoneOtpSent(false);
          setPhoneCountdown(0);
        }
      } else if (name === "email") {
        if (value === verifiedEmail && verifiedEmail !== "") {
          setIsEmailVerified(true);
        } else {
          setIsEmailVerified(false);
          setEmailOtpSent(false);
          setEmailCountdown(0);
        }
      }
    }
    if (name === "confirmPassword") {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  // Password Strength Checks
  const passwordCriteria = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(formData.password) },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "At least 1 number", met: /\d/.test(formData.password) },
    { label: "At least 1 special character", met: /[\W_]/.test(formData.password) },
  ];

  const isPasswordStrong = passwordCriteria.every((c) => c.met);





  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };


  const handleNext = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      toast.error("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character");
      return;
    }

    try {
      // Check if user already exists
      await checkUserExists({ email: formData.email, phone: formData.phone });
      setStep(2);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string; fields?: { email: boolean; phone: boolean } }>;
      const errorData = error.response?.data;

      if (errorData?.fields) {
        setFieldErrors({
          ...fieldErrors,
          email: errorData.fields.email ? "email already used" : "",
          phone: errorData.fields.phone ? "number already used" : "",
        });
      } else {
        const errorMsg = errorData?.message || "Something went wrong";
        toast.error(errorMsg);
      }
    }
  };


  const handleSendPhoneOtp = async () => {
    if (!formData.phone) {
      toast.error("Please enter phone number");
      return;
    }
    try {
      const res = await sendPhoneOtp(formData.phone);
      setPhoneOtpSent(true);
      setPhoneCountdown(60);

      // Automatically fill the OTP code
      if (res.otp) {
        const otpStr = String(res.otp);
        setPhoneOtp(otpStr);
        // Automatically verify after a short delay to show the code filling in
        setTimeout(() => {
          handleVerifyPhone(otpStr);
        }, 500);
      }

      toast.success("OTP sent to your phone");

    } catch (err) {
      toast.error("Failed to send phone OTP");
    }
  };

  const handleVerifyPhone = async (otpOverride?: string) => {
    const otpToVerify = otpOverride || phoneOtp;
    if (otpToVerify.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    try {
      const res = await verifyPhoneOtp(formData.phone, otpToVerify);
      if (res.success) {
        setIsPhoneVerified(true);
        setVerifiedPhone(formData.phone);
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
    if (!formData.email) {
      toast.error("Please enter email");
      return;
    }
    try {
      await sendOtp(formData.email);
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
      const res = await verifyOtp(formData.email, emailOtp);
      if (res.success) {
        setIsEmailVerified(true);
        setVerifiedEmail(formData.email);
        setEmailOtpSent(false);
        toast.success("Email verified successfully!");

      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignup) {
      handleLogin();
      return;
    }

    if (!isPhoneVerified) {
      toast.error("Phone verification is required");
      return;
    }

    try {
      let profilePicUrl = "";
      if (profileImage) {
        try {
          profilePicUrl = await uploadToCloudinary(profileImage);
        } catch (error) {
          console.error("Image upload failed:", error);
          toast.error("Failed to upload image. Please try again.");
          return;
        }
      }

      const { confirmPassword, ...signupData } = formData;
      const res = await signupUser({ ...signupData, profilePic: profilePicUrl });
      localStorage.setItem("token", res.token);
      localStorage.setItem("isLoggedIn", "true");
      authEvents.dispatch();
      toast.success("Signup successful 🎉");

      setTimeout(() => {
        onClose?.();
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          navigate("/home-baraka");
        }
      }, 800);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMsg = error.response?.data?.message || "Signup failed";
      toast.error(errorMsg);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("token", res.token);
      localStorage.setItem("isLoggedIn", "true");
      authEvents.dispatch();
      toast.success("Login successful ✅");
      setTimeout(() => {
        onClose?.();
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          navigate("/home-baraka");
        }
      }, 800);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
    }
  };

  const [forgotMethod, setForgotMethod] = useState<"email" | "whatsapp">("email");
  const [forgotValue, setForgotValue] = useState("");

  const handleForgotPasswordSubmit = async () => {
    if (!forgotValue) {
      toast.error(`Please enter your ${forgotMethod}`);
      return;
    }

    try {
      const data = forgotMethod === "email" ? { email: forgotValue } : { phone: forgotValue };
      const res = await forgotPassword(data);

      if (res.link) {
        toast.success(`Password reset link (Mock): ${res.link}`);
      } else {
        toast.success(res.message);
      }
      setIsForgotPassword(false); // Return to login
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMsg = error.response?.data?.message || "Failed to process request";
      toast.error(errorMsg);
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
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 420,
          mx: "auto",
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          position: "relative",
          boxShadow: "0px 6px 20px rgba(0,0,0,0.1)",
        }}
      >
        {onClose && (
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 8,
              color: "#111827",
              "&:hover": { color: "#059669" },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}

        <Typography
          variant="h5"
          fontWeight={600}
          mb={3}
          textAlign="left"
          sx={{ color: "#111827" }}
        >
          {isForgotPassword ? "Reset Password" : (isSignup ? `Signup Step ${step}` : "Login to Continue")}
        </Typography>

        {isForgotPassword ? (
          <Box>
            <FormControl component="fieldset" margin="normal">
              <RadioGroup row value={forgotMethod} onChange={(e) => setForgotMethod(e.target.value as "email" | "whatsapp")}>
                <FormControlLabel value="email" control={<Radio />} label="Email" />
                <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label={forgotMethod === "email" ? "Enter Email" : "Enter WhatsApp Number"}
              value={forgotValue}
              onChange={(e) => setForgotValue(e.target.value)}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleForgotPasswordSubmit}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.2,
                background: "linear-gradient(90deg, #04AA6D 0%, #017F52 100%)",
                borderRadius: 1.5,
              }}
            >
              Send Reset Link
            </Button>
            <Button fullWidth onClick={() => setIsForgotPassword(false)} sx={{ color: "#666" }}>
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {isSignup ? (
              step === 1 ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <input
                      accept="image/*"
                      style={{ display: "none" }}
                      id="icon-button-file"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="icon-button-file">
                      <IconButton color="primary" component="span">
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                          badgeContent={
                            <CameraAltIcon
                              sx={{
                                border: "2px solid white",
                                borderRadius: "50%",
                                padding: "4px",
                                backgroundColor: "#04AA6D",
                                color: "white",
                                width: 30,
                                height: 30,
                              }}
                            />
                          }
                        >
                          <Avatar
                            src={previewUrl}
                            sx={{ width: 80, height: 80, border: "2px solid #ddd" }}
                          />
                        </Badge>
                      </IconButton>
                    </label>
                  </Box>
                  <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: -1, mb: 1 }}>
                    select image less than 5mb
                  </Typography>

                  <TextField
                    fullWidth
                    label="Name*"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    margin="dense"
                  />
                  <TextField
                    fullWidth
                    label="Phone No*"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                    margin="dense"
                    error={!!fieldErrors.phone}
                    helperText={fieldErrors.phone}
                  />
                  <TextField
                    fullWidth
                    label="Email*"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    margin="dense"
                    error={!!fieldErrors.email}
                    helperText={fieldErrors.email}
                  />

                  <TextField
                    fullWidth
                    label="Password*"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Password Strength Indicators */}
                  {formData.password && !isPasswordStrong && (
                    <Box sx={{ mt: 1, mb: 1, pl: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                        Password must contain:
                      </Typography>
                      {passwordCriteria.map((criterion, index) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {criterion.met ? (
                            <CheckCircleIcon color="success" sx={{ fontSize: 14 }} />
                          ) : (
                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid #ccc" }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{ color: criterion.met ? "success.main" : "text.secondary" }}
                          >
                            {criterion.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <TextField
                    fullWidth
                    label="Confirm Password*"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="dense"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!fieldErrors.confirmPassword}
                    helperText={fieldErrors.confirmPassword}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.2,
                      background: "linear-gradient(90deg, #04AA6D 0%, #017F52 100%)",
                      borderRadius: 1.5,
                    }}
                  >
                    Next
                  </Button>
                </>
              ) : (
                <>
                  {/* Step 2: Verification */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Phone Verification (OTP Sent to Your Number)"
                      value={formData.phone}
                      disabled
                      InputProps={{
                        endAdornment: isPhoneVerified && (
                          <InputAdornment position="end">
                            <CheckCircleIcon color="success" />
                          </InputAdornment>
                        ),
                      }}
                      margin="normal"
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

                    {phoneOtpSent && !isPhoneVerified && OTPInput(phoneOtp, setPhoneOtp, phoneOtpRefs, () => handleVerifyPhone())}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Email (Optional Verification)"
                      value={formData.email}
                      disabled
                      InputProps={{
                        endAdornment: isEmailVerified && (
                          <InputAdornment position="end">
                            <CheckCircleIcon color="success" />
                          </InputAdornment>
                        ),
                      }}
                      margin="normal"
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

                  {isPhoneVerified && (
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{
                        mt: 3,
                        mb: 2,
                        py: 1.2,
                        background: "linear-gradient(90deg, #04AA6D 0%, #017F52 100%)",
                        borderRadius: 1.5,
                      }}
                    >
                      Start Barakah
                    </Button>
                  )}

                  <Button fullWidth onClick={() => setStep(1)} sx={{ color: "#666" }}>
                    Back
                  </Button>
                </>
              )
            ) : (
              <>
                {/* Login Flow */}
                <TextField
                  fullWidth
                  label="Email*"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password*"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.2,
                    background: "linear-gradient(90deg, #04AA6D 0%, #017F52 100%)",
                    borderRadius: 1.5,
                  }}
                >
                  Log in
                </Button>
              </>
            )}

            {!isSignup && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsForgotPassword(true)}
                  sx={{ textDecoration: 'none', color: '#059669', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
              </Box>
            )}

            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Link
                href="#"
                underline="hover"
                sx={{ color: "#059669" }}
                onClick={handleToggle}
              >
                {isSignup ? "Log in" : "Sign up"}
              </Link>
            </Typography>
          </Box>
        )}
      </Paper >
    </Box >
  );
};

export default SignupForm;


