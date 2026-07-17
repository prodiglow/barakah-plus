import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleHomeNavigation = () => {
        if (location.pathname.includes('/home-baraka')) {
            navigate('/home-baraka');
        } else {
            navigate('/');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f9f9',
                py: 8
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ textAlign: 'center' }}>
                    {/* Icon */}
                    <ErrorOutlineIcon
                        sx={{
                            fontSize: 120,
                            color: '#1db954',
                            mb: 3
                        }}
                    />

                    {/* 404 Text */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '6rem', md: '8rem' },
                            fontWeight: 'bold',
                            background: 'linear-gradient(90deg, #1db954, #11998e)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }}
                    >
                        404
                    </Typography>

                    {/* Message */}
                    <Typography
                        variant="h5"
                        sx={{
                            color: '#333',
                            fontWeight: 600,
                            mb: 2
                        }}
                    >
                        Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: '#666',
                            mb: 4,
                            maxWidth: 400,
                            mx: 'auto'
                        }}
                    >
                        Sorry, the page you are looking for doesn't exist or has been moved.
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            onClick={handleHomeNavigation}
                            sx={{
                                borderRadius: '25px',
                                background: 'linear-gradient(90deg, #1db954, #11998e)',
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                }
                            }}
                        >
                            Go to Home
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => navigate(-1)}
                            sx={{
                                borderRadius: '25px',
                                borderColor: '#1db954',
                                color: '#1db954',
                                textTransform: 'none',
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem',
                                '&:hover': {
                                    borderColor: '#11998e',
                                    backgroundColor: 'rgba(29, 185, 84, 0.1)'
                                }
                            }}
                        >
                            Go Back
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default NotFoundPage;
