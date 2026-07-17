import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Chip,
    Stack,
    CircularProgress,
    IconButton,
    Paper,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { getProductById } from '../../services/islamicProductService';
import { useCart } from '../../context/CartContext';

interface Product {
    _id: string;
    name: string;
    category: string;
    actualPrice: number;
    salePrice: number;
    description: string;
    imageUrl: string;
    stock: number;
}

const ProductDetailsPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) return;
            try {
                const data = await getProductById(productId);
                setProduct(data);
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (product.stock <= 0) {
            toast.warning(`${product.name} is out of stock!`);
            return;
        }
        addToCart({
            id: product._id,
            name: product.name,
            image: product.imageUrl,
            category: product.category,
            price: product.salePrice,
            quantity: quantity
        });
        toast.success(`${quantity} x ${product.name} added to cart!`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
                <Typography variant="h5" color="error">{error || "Product not found"}</Typography>
                <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2, bgcolor: '#108960' }}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8, bgcolor: '#fff', minHeight: '100vh', pt: { xs: 12, md: 4 } }}>
            <Container>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 4, color: '#333' }}
                >
                    Back to Products
                </Button>

                <Grid container spacing={6}>
                    {/* Left: Product Image */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 4,
                                overflow: 'hidden',
                                bgcolor: '#f5f5f5',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: { xs: '300px', md: '500px' },
                                position: 'relative',
                                cursor: 'crosshair',
                                '&:hover img': {
                                    opacity: 1 // Keep image visible
                                }
                            }}
                            onMouseMove={(e) => {
                                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                                const x = ((e.clientX - left) / width) * 100;
                                const y = ((e.clientY - top) / height) * 100;
                                const img = e.currentTarget.querySelector('img');
                                if (img) {
                                    img.style.transformOrigin = `${x}% ${y}%`;
                                    img.style.transform = 'scale(2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const img = e.currentTarget.querySelector('img');
                                if (img) {
                                    img.style.transform = 'scale(1)';
                                    setTimeout(() => {
                                        // Reset origin after transition to avoid jumpiness
                                        img.style.transformOrigin = 'center center';
                                    }, 300);
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src={product.imageUrl}
                                alt={product.name}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    transition: 'transform 0.2s ease-out',
                                    transformOrigin: 'center center'
                                }}
                            />
                        </Paper>
                    </Grid>

                    {/* Right: Product Details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box>
                            <Typography variant="overline" sx={{ color: '#108960', fontWeight: 'bold', fontSize: '1rem' }}>
                                {product.category}
                            </Typography>

                            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, mb: 2, color: '#212121' }}>
                                {product.name}
                            </Typography>

                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h4" fontWeight="bold" sx={{ color: '#108960' }}>
                                    PKR {product.salePrice.toLocaleString()}
                                </Typography>
                                {product.salePrice < product.actualPrice && (
                                    <>
                                        <Typography variant="h5" sx={{ textDecoration: 'line-through', color: '#9e9e9e' }}>
                                            PKR {product.actualPrice.toLocaleString()}
                                        </Typography>
                                        <Chip
                                            label={`${Math.round(((product.actualPrice - product.salePrice) / product.actualPrice) * 100)}% OFF`}
                                            color="error"
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </>
                                )}
                            </Stack>

                            <Divider sx={{ mb: 3 }} />

                            {/* Quantity Selector */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Quantity</Typography>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '50px',
                                            px: 1,
                                            py: 0.5
                                        }}
                                    >
                                        <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} size="small">
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography sx={{ mx: 2, minWidth: '20px', textAlign: 'center', fontWeight: 'bold', color: 'black' }}>{quantity}</Typography>
                                        <IconButton onClick={() => handleQuantityChange(1)} size="small">
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Action Buttons */}
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleAddToCart}
                                    sx={{
                                        bgcolor: '#108960',
                                        px: 6,
                                        py: 1.5,
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        '&:hover': { bgcolor: '#0d704e' },
                                        flexGrow: { xs: 1, md: 0 }
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

                {/* Description Section */}
                <Box sx={{ mt: 8 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#333' }}>
                        Description
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="body1" sx={{ color: '#616161', lineHeight: 1.8 }}>
                        {product.description}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ProductDetailsPage;
