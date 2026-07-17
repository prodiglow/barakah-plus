import React from 'react';
import { Box, Typography, Container, Grid, Paper, Link as MuiLink } from '@mui/material';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactUs: React.FC = () => {
    return (
        <Box sx={{ py: 8, backgroundColor: '#f9fafb', minHeight: '80vh' }}>
            <Container maxWidth="lg">
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: '3rem',
                            color: '#2c5530',
                            fontWeight: 'bold',
                            fontFamily: '"Playfair Display", serif',
                            mb: 2
                        }}
                    >
                        Contact Us
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                            maxWidth: '700px',
                            margin: '0 auto',
                            lineHeight: 1.6,
                            fontWeight: 'normal'
                        }}
                    >
                        We're here to assist you with any questions or concerns.
                        Reach out to us through any of the channels below.
                    </Typography>
                </Box>

                <Grid container spacing={4} sx={{ mb: 8 }}>
                    {/* Email Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            height: '100%',
                            textAlign: 'center',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: '#e8f5e9',
                                color: '#2c5530',
                                mb: 3
                            }}>
                                <FaEnvelope size={30} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2c5530' }}>
                                Email Us
                            </Typography>
                            <MuiLink
                                href="mailto:info@barakah.com"
                                sx={{
                                    color: '#666',
                                    textDecoration: 'none',
                                    fontSize: '1.1rem',
                                    '&:hover': { color: '#2c5530' }
                                }}
                            >
                                info@barakah.com
                            </MuiLink>
                        </Paper>
                    </Grid>

                    {/* Phone Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            height: '100%',
                            textAlign: 'center',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: '#e8f5e9',
                                color: '#2c5530',
                                mb: 3
                            }}>
                                <FaPhone size={30} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2c5530' }}>
                                Call Us
                            </Typography>
                            <MuiLink
                                href="tel:+923001234567"
                                sx={{
                                    color: '#666',
                                    textDecoration: 'none',
                                    fontSize: '1.1rem',
                                    '&:hover': { color: '#2c5530' }
                                }}
                            >
                                +92 300 1234567
                            </MuiLink>
                        </Paper>
                    </Grid>

                    {/* Address Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{
                            p: 4,
                            height: '100%',
                            textAlign: 'center',
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-5px)' }
                        }}>
                            <Box sx={{
                                display: 'inline-flex',
                                p: 2,
                                borderRadius: '50%',
                                backgroundColor: '#e8f5e9',
                                color: '#2c5530',
                                mb: 3
                            }}>
                                <FaMapMarkerAlt size={30} />
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#2c5530' }}>
                                Our Location
                            </Typography>
                            <Typography sx={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                320 K1, Wapda Town, Lahore, Pakistan
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Map Section
                <Box sx={{
                    marginTop: "100px",
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    backgroundColor: 'white'
                }}>
                    <iframe
                        title="Barakah Lahore Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.378772396!2d74.3475!3d31.5175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919045a28ea5633%3A0xc07a840e79148d3!2sAl%20Hafeez%20Heights!5e0!3m2!1sen!2spk!4v1712061234567!5m2!1sen!2spk"
                        width="100%"
                        height="500"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </Box> */}
            </Container>
        </Box>
    );
};

export default ContactUs;
