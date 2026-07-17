import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/adminService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotMethod, setForgotMethod] = useState<"email" | "whatsapp">("email");
  const [forgotValue, setForgotValue] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      } else {
        toast.success("Login successful ✅");
      }
    } catch (error: unknown) {
      // Handle axios errors
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'An error occurred during login';
        setError(message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
      const error = err as any;
      const errorMsg = error.response?.data?.message || "Failed to process request";
      toast.error(errorMsg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        position: 'relative',
        p: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '100%', sm: 400 },
          maxWidth: { xs: '100%', sm: 400 },
          bgcolor: 'white',
          borderRadius: { xs: 2, md: '12px' },
          boxShadow: { xs: 0, sm: 24 },
          border: { xs: '1px solid #eee', sm: 'none' },
          p: { xs: 3, sm: 4 },
          zIndex: 1,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 3,
            color: 'black',
            textAlign: 'center',
          }}
        >
          {isForgotPassword ? "Reset Password" : "Login to Continue"}
        </Typography>

        {isForgotPassword ? (
          <Box>
            <FormControl component="fieldset" margin="normal">
              <RadioGroup row value={forgotMethod} onChange={(e) => setForgotMethod(e.target.value as "email" | "whatsapp")}>
                <FormControlLabel value="email" control={<Radio />} label="Email" sx={{ color: "black" }} />
                <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" sx={{ color: "black" }} />
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
          <Box component="form" onSubmit={handleLogin}>
            {error && (
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Email*"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
              InputLabelProps={{
                sx: {
                  '&.Mui-focused': {
                    color: '#4CAF50',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password*"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                onClick={() => setIsForgotPassword(true)}
                sx={{
                  textTransform: 'none',
                  color: '#0A9E6F',
                  fontSize: '0.9rem',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)',
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  background: 'linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)',
                },
                '&:disabled': {
                  background: 'linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)',
                  opacity: 0.7,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Log in'
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;

