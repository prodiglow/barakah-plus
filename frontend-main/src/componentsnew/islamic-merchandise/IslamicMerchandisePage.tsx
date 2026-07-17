import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Placeholder images - using colored placeholders for now or generic online ones if possible, 
// but stick to colors/text for safety or simple placeholders.
// I'll use placeholders from text or simple colors to avoid broken links.
// Ideally I'd use the generate_image tool but for now I'll just use colored boxes or simple text.
// Actually, I can use a simple placeholder service or just specific colors.
// Let's use a nice gradient or solid color for the hero and simple backgrounds for cards.

const THEME_GREEN = '#108960';

const categories = [
    {
        title: 'Prayers Mats & Caps',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/8da69203b6f6d16b3bb16da47d81bd0534d06f26_hrolmf.jpg',
        buttonText: 'View'
    },
    {
        title: 'Accessories',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/4959111f78d2e9354c03ab5be655edad7e12e9b1_avo6gr.jpg',
        buttonText: 'View'
    },
    {
        title: 'Islamic books & Literature',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516400/3ced35ac20c2a61a85bf8d77d5eaca480118afb0_jmji9j.jpg',
        buttonText: 'View'
    },
    {
        title: 'Prayer Mat',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/5b73a0a574a2dcb2266074cd9fa5b040ccbe3d82_musvlv.jpg',
        buttonText: 'View'
    },
    {
        title: 'White Knit Kufi Cap',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/7e216fafb151b30e909938579ae55ec78f1a0998_tbxkdg.jpg',
        buttonText: 'View'
    },
    {
        title: 'Tasbih',
        image: 'https://res.cloudinary.com/debszasgn/image/upload/v1769516399/e7eaed9644f2f25623e9f6937841392545185e74_md8jcb.jpg',
        buttonText: 'View'
    },
];

const IslamicMerchandisePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ pb: 8, bgcolor: '#f9f9f9', minHeight: '100vh', pt: { xs: 10, md: 0 } }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    height: 300,
                    backgroundImage: 'url(https://res.cloudinary.com/debszasgn/image/upload/v1769516405/05e099c4684a969a79bffde0c6508523d283b22a_nfert0.jpg)', // Replace with actual hero image
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fff',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                    },
                }}
            >
                <Container sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                        Islamic Merchandise
                    </Typography>
                    <Typography variant="h6" component="p">
                        Your Home for Islamic Essentials More Than Products, It’s Baraka.
                    </Typography>
                </Container>
            </Box>

            <Container sx={{ mt: 4 }}>


                {/* Main Categories */}
                <Typography
                    variant="h5"
                    component="h2"
                    fontWeight="bold"
                    sx={{
                        mb: 3,
                        background: "linear-gradient(90deg, #1db954, #11998e)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        width: 'fit-content'
                    }}
                >
                    Main Categories
                </Typography>
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {categories.map((cat, index) => (
                        <Grid size={{ xs: 12, md: 4 }} key={index}>
                            <Card
                                onClick={() => navigate(`/islamic-merchandise/${encodeURIComponent(cat.title)}`)}
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={cat.image}
                                    alt={cat.title}
                                />
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        {cat.title}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ px: 2, pb: 2 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{
                                            bgcolor: THEME_GREEN,
                                            '&:hover': { bgcolor: '#0d704e' },
                                            textTransform: 'none',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {cat.buttonText}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default IslamicMerchandisePage;
