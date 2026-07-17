import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Typography,
    TextField,
    Button,
    Paper,
    Container,
    Box,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPassword } from "../services/adminService";
import { AxiosError } from "axios";

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    // Field Errors
    const [fieldErrors, setFieldErrors] = useState({
        password: "",
        confirmPassword: "",
    });

    // Password Strength Checks
    const passwordCriteria = [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
        { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
        { label: "At least 1 number", met: /\d/.test(password) },
        { label: "At least 1 special character", met: /[\W_]/.test(password) },
    ];

    const isPasswordStrong = passwordCriteria.every((c) => c.met);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "password") setPassword(value);
        if (name === "confirmPassword") setConfirmPassword(value);

        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    useEffect(() => {
        if (token) {
            try {
                // Simple JWT decode to check expiration
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const { exp } = JSON.parse(jsonPayload);

                if (Date.now() >= exp * 1000) {
                    setIsExpired(true);
                }
            } catch (e) {
                // If token is malformed, treat as invalid/expired
                setIsExpired(true);
            }
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing token.");
            return;
        }

        if (password !== confirmPassword) {
            setFieldErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
            return;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            toast.error("Password is too weak");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ token, newPassword: password });
            toast.success("Password reset successfully! Redirecting...");
            setTimeout(() => navigate("/"), 2000); // Redirect to Login
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            const errorMsg = error.response?.data?.message || "Failed to reset password";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (isExpired) {
        return (
            <Container
                maxWidth="sm"
                sx={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 2, textAlign: 'center' }}>
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight="bold" gutterBottom color="error">
                        Link Expired
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mb={3}>
                        This password reset link has expired. Please request a new one.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/")}
                        sx={{
                            background: "linear-gradient(90deg, #1db954, #11998e)",
                        }}
                    >
                        Back to Login
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (!token) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
                <Typography variant="h5" color="error">
                    Invalid or Missing Reset Token
                </Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <ToastContainer position="top-right" theme="colored" />
            <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
                    Reset Password
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" mb={3}>
                    Enter your new password below.
                </Typography>

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="New Password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!fieldErrors.password}
                        helperText={fieldErrors.password}
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
                    {password && !isPasswordStrong && (
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
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                        error={!!fieldErrors.confirmPassword}
                        helperText={fieldErrors.confirmPassword}
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
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            mb: 2,
                            background: "linear-gradient(90deg, #04AA6D 0%, #017F52 100%)",
                        }}
                    >
                        {loading ? "Resetting..." : "Update Password"}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ResetPasswordPage;
