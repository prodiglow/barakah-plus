/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Chip,
    Stack,
    CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getProductsByCategory } from '../../services/islamicProductService';
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

const CategoryProductsPage: React.FC = () => {
    const { t } = useTranslation();
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (category) {
                    const data = await getProductsByCategory(category);
                    setProducts(data);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(t('category.loadError'));
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            fetchProducts();
        }
    }, [category]);

    const handleAddToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.warning(t('category.outOfStockToast', { name: product.name }));
            return;
        }
        addToCart({
            id: product._id,
            name: product.name,
            image: product.imageUrl,
            category: product.category,
            price: product.salePrice,
            quantity: 1
        });
        toast.success(t('category.addedToCartToast', { name: product.name }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress color="success" />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 8, bgcolor: '#f9f9f9', minHeight: '100vh', pt: { xs: 12, md: 4 } }}>
            <Container>
                {/* Header */}
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        color: '#333'
                    }}
                >
                    {category}
                </Typography>

                {error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : (
                    <Grid container spacing={4}>
                        {products.map((product) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    position: 'relative',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                    }
                                }}>
                                    {/* Sale Badge */}
                                    {product.salePrice < product.actualPrice && (
                                        <Chip
                                            label={t('common.sale')}
                                            color="error"
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                fontWeight: 'bold',
                                                zIndex: 1
                                            }}
                                        />
                                    )}

                                    <CardMedia
                                        component="img"
                                        height="250"
                                        image={product.imageUrl}
                                        alt={product.name}
                                        sx={{ objectFit: 'cover' }}
                                    />

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                                            {product.name}
                                        </Typography>

                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                            <Typography variant="h6" color="primary" fontWeight="bold" sx={{ color: '#108960' }}>
                                                PKR {product.salePrice.toLocaleString()}
                                            </Typography>
                                            {product.salePrice < product.actualPrice && (
                                                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                                    PKR {product.actualPrice.toLocaleString()}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Grid container spacing={1}>
                                            <Grid size={{ xs: 6 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    onClick={() => navigate(`/islamic-products/${product._id}`)}
                                                    sx={{
                                                        color: '#108960',
                                                        borderColor: '#108960',
                                                        '&:hover': {
                                                            borderColor: '#0d704e',
                                                            bgcolor: 'rgba(16, 137, 96, 0.04)'
                                                        }
                                                    }}
                                                >
                                                    {t('common.view')}
                                                </Button>
                                            </Grid>
                                            <Grid size={{ xs: 6 }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handleAddToCart(product)}
                                                    sx={{
                                                        bgcolor: '#108960',
                                                        '&:hover': { bgcolor: '#0d704e' }
                                                    }}
                                                >
                                                    {t('common.addToCart')}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default CategoryProductsPage;
