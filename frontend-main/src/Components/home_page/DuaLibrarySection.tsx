import React from 'react';
import { Box, Typography, Button, Grid, Card, CardMedia } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import category1 from '../../assets/category1.jpg';
import category2 from '../../assets/category2.jpg';
import category3 from '../../assets/category3.jpg';
import category4 from '../../assets/category4.jpg';

const categories = [
    { title: "Morning & Evening", image: category1 },
    { title: "Protection", image: category2 },
    { title: "Rizq & Wealth", image: category3 },
    { title: "Family & Home", image: category4 },
];

const DuaLibrarySection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            padding: { xs: 4, sm: 8, md: 15 },
            textAlign: 'center',
            backgroundColor: '#f9f9f9'
        }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }, color: 'black' }}
            >
                Explore Free Dua Library
            </Typography>
            <Typography
                variant="body1"
                color="textSecondary"
                paragraph
                sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
            >
                Find peace, guidance, and blessings with our extensive collection of authentic Duas for every occasion.
            </Typography>

            <Grid container spacing={2} justifyContent="center" sx={{ mb: 6 }}>
                {categories.map((cat, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                        <Card sx={{
                            boxShadow: 'none',
                            backgroundColor: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            <Box sx={{
                                width: 200,
                                height: 200,
                                overflow: 'hidden',
                                borderRadius: '20px',
                                mb: 2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                '&:hover': { transform: 'scale(1.05)' }
                            }}>
                                <CardMedia
                                    component="img"
                                    image={cat.image}
                                    alt={cat.title}
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {cat.title}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                onClick={() => navigate('/islamic-duas')}
                sx={{
                    borderRadius: "10px",
                    background: "linear-gradient(90deg, #1db954, #11998e)",
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
                }}
            >
                Explore More
            </Button>
        </Box>
    );
};

export default DuaLibrarySection;
