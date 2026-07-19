import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardMedia, CardContent, CardActions, Chip, Stack, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getAllProducts } from '../services/islamicProductService';
import { useCart } from '../context/CartContext';

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

const HomePage1: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.warning(t('home.outOfStockToast', { name: product.name }));
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
        toast.success(t('home.addedToCartToast', { name: product.name }));
    };

    // Get random 4 products for featured section
    const getFeaturedProducts = () => {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    };

    // Get products by category
    const getProductsByCategory = (category: string) => {
        return products.filter(p => p.category === category).slice(0, 4);
    };

    // Product Card Component
    const ProductCard = ({ product }: { product: Product }) => (
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
                height="220"
                image={product.imageUrl}
                alt={product.name}
                sx={{ objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => navigate(`/islamic-products/${product._id}`)}
            />
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Typography gutterBottom variant="subtitle1" component="div" fontWeight="bold" sx={{ color: '#333' }}>
                    {product.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                        PKR {product.salePrice.toLocaleString()}
                    </Typography>
                    {product.salePrice < product.actualPrice && (
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            PKR {product.actualPrice.toLocaleString()}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        navigate(`/islamic-products/${product._id}`);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    sx={{
                        flex: 1,
                        borderColor: '#009688',
                        color: '#009688',
                        '&:hover': {
                            bgcolor: '#009688',
                            color: 'white',
                            borderColor: '#009688'
                        }
                    }}
                >
                    {t('common.view')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    sx={{
                        flex: 1,
                        bgcolor: product.stock <= 0 ? '#ccc' : '#009688',
                        '&:hover': { bgcolor: product.stock <= 0 ? '#ccc' : '#00796B' }
                    }}
                >
                    {product.stock <= 0 ? t('common.outOfStock') : t('common.addToCart')}
                </Button>
            </CardActions>
        </Card>
    );

    // Section Component for products
    const ProductSection = ({ title, products: sectionProducts, categoryLink }: { title: string, products: Product[], categoryLink?: string }) => (
        <Box sx={{ py: 6, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ color: '#009688', fontWeight: 'bold', fontFamily: "'Playfair Display', serif" }}>
                        {title}
                    </Typography>
                    {categoryLink && (
                        <Button
                            variant="outlined"
                            onClick={() => { window.scrollTo(0, 0); navigate(categoryLink); }}
                            sx={{ borderColor: '#009688', color: '#009688', '&:hover': { bgcolor: '#009688', color: 'white' } }}
                        >
                            {t('common.viewAll')}
                        </Button>
                    )}
                </Box>
                <Grid container spacing={3}>
                    {sectionProducts.map((product) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product._id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );

    return (
        <Box sx={{ backgroundColor: '#f9f9f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: { xs: '60vh', md: '80vh' }, // Responsive height
                    backgroundImage: 'url(https://res.cloudinary.com/debszasgn/image/upload/v1769583261/banner-img-1_dxfnoz.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for text readability
                        zIndex: 1,
                    },
                }}
            >
                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>

                    {/* Bismillah */}
                    <Typography
                        variant="h3"
                        component="div"
                        sx={{
                            fontFamily: "'Amiri', serif", // Using a serif font usually good for Arabic
                            mb: 2,
                            fontWeight: 'bold'
                        }}
                    >
                        ﷽
                    </Typography>

                    {/* Hadith */}
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{ mb: 1, fontWeight: 500 }}
                    >
                        {t('home.hadithIntro')}
                    </Typography>

                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            mb: 4,
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                            fontSize: { xs: '1.5rem', md: '2.5rem' }
                        }}
                    >
                        {t('home.hadithText')}
                    </Typography>

                    <Box sx={{ mt: 8 }}>
                        {/* Slogan */}
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ mb: 3, letterSpacing: 1 }}
                        >
                            {t('home.slogan')}
                        </Typography>

                        {/* Button */}
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/shop-islamic')}
                            sx={{
                                bgcolor: '#1db954',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.2rem',
                                borderRadius: '30px',
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#14803a',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.3s'
                            }}
                        >
                            {t('common.shopNow')}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 10, bgcolor: 'white', textAlign: 'center', width: '100%' }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" sx={{ color: '#009688', fontWeight: 'bolder', mb: 2, width: '100%', fontSize: '2rem' }}>
                        {t('home.featuresTitle')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mb: 8, mx: 'auto', lineHeight: 1.8, width: '100%', fontSize: '1.2rem' }}>
                        {t('home.featuresSubtitle')}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 4 }}>
                        {/* Feature 1 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                                width: 350, height: 350, mb: 2,

                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src="https://kunpk.com/wp-content/uploads/2024/12/last-icon-1-900x900.png" alt={t('home.featureAllOverPakistan')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>

                        </Box>

                        {/* Feature 2 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                                width: 350, height: 350, mb: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src="https://kunpk.com/wp-content/uploads/2024/12/last-icon-2--900x900.png" alt={t('home.featureSecurePayment')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>

                        </Box>

                        {/* Feature 3 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{
                                width: 350, height: 350, mb: 2,

                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <img src="https://kunpk.com/wp-content/uploads/2024/12/last-icon-3-900x900.png" alt={t('home.featureFreeShipping')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </Box>

                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Categories Section */}
            <Box sx={{ pb: 20, bgcolor: 'white', textAlign: 'center' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" sx={{ color: '#009688', fontWeight: 'bold', mb: 6, fontFamily: "'Playfair Display', serif" }}>
                        {t('home.shopByCategory')}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
                        {[
                            {
                                name: t('home.categoryPrayerMats'),
                                image: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/5b73a0a574a2dcb2266074cd9fa5b040ccbe3d82_musvlv.jpg",
                                link: "/islamic-merchandise/Prayers%20Mats%20&%20Caps"
                            },
                            {
                                name: t('home.categoryAccessories'),
                                image: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/e7eaed9644f2f25623e9f6937841392545185e74_md8jcb.jpg",
                                link: "/islamic-merchandise/Accessories"
                            },
                            {
                                name: t('home.categoryIslamicBooks'),
                                image: "https://res.cloudinary.com/debszasgn/image/upload/v1769516400/3ced35ac20c2a61a85bf8d77d5eaca480118afb0_jmji9j.jpg",
                                link: "/islamic-merchandise/Islamic%20books%20&%20Literature"
                            },
                            {
                                name: t('home.categoryTasbih'),
                                image: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/4959111f78d2e9354c03ab5be655edad7e12e9b1_avo6gr.jpg",
                                link: "/islamic-merchandise/Tasbih"
                            }
                        ].map((category, index) => (
                            <Box
                                key={index}
                                onClick={() => navigate(category.link)}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    '&:hover .category-image': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                                    },
                                    '&:hover .category-name': {
                                        color: '#009688'
                                    }
                                }}
                            >
                                <Box
                                    className="category-image"
                                    sx={{
                                        width: 220,
                                        height: 220,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        mb: 3,
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                        border: '4px solid white'
                                    }}
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </Box>
                                <Typography
                                    className="category-name"
                                    variant="h6"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: '#333',
                                        transition: 'color 0.3s',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}
                                >
                                    {category.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Show All Button */}
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => { window.scrollTo(0, 0); navigate('/islamic-merchandise'); }}
                            sx={{
                                borderColor: '#009688',
                                color: '#009688',
                                px: 5,
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#009688',
                                    color: 'white',
                                    borderColor: '#009688'
                                }
                            }}
                        >
                            {t('home.showAllCategories')}
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Why Choose Baraka Plus Section */}
            <Box sx={{ py: 8, bgcolor: '#E8F5E9', textAlign: 'left' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                        {/* Image with decorative frames */}
                        <Box sx={{ position: 'relative', flex: '1 1 400px', maxWidth: 500 }}>
                            <Box sx={{
                                position: 'absolute',
                                top: -15,
                                left: -15,
                                width: '100%',
                                height: '100%',
                                border: '4px solid #009688',
                                zIndex: 0
                            }} />
                            <Box sx={{
                                position: 'absolute',
                                top: 15,
                                left: 15,
                                width: '100%',
                                height: '100%',
                                border: '4px solid #FFD700',
                                zIndex: 0
                            }} />
                            <img
                                src="https://res.cloudinary.com/debszasgn/image/upload/v1769516400/3ced35ac20c2a61a85bf8d77d5eaca480118afb0_jmji9j.jpg"
                                alt={t('home.islamicProductsAlt')}
                                style={{
                                    width: '100%',
                                    height: '550px',
                                    objectFit: 'cover',
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'block'
                                }}
                            />
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Typography variant="h4" sx={{ color: '#009688', fontWeight: 'bold', mb: 3, fontFamily: "'Playfair Display', serif" }}>
                                {t('home.whyChooseTitle')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#555', mb: 3, lineHeight: 1.8, fontSize: '1rem' }}>
                                {t('home.whyChooseBody')}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#333', fontStyle: 'italic', mb: 4, fontWeight: 500 }}>
                                {t('home.trustQuote')}
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/shop-islamic')}
                                sx={{
                                    borderColor: '#009688',
                                    color: '#009688',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: '#009688',
                                        color: 'white',
                                        borderColor: '#009688'
                                    }
                                }}
                            >
                                {t('home.exploreShopBtn')}
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Product Sections */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress color="success" />
                </Box>
            ) : (
                <>
                    {/* Featured Products */}
                    <ProductSection
                        title={t('home.sectionFeatured')}
                        products={getFeaturedProducts()}
                        categoryLink="/shop-islamic"
                    />

                    {/* Prayer Mats & Caps */}
                    <Box sx={{ bgcolor: '#f9f9f9' }}>
                        <ProductSection
                            title={t('home.sectionPrayerMats')}
                            products={getProductsByCategory("Prayers Mats & Caps")}
                            categoryLink="/islamic-merchandise/Prayers%20Mats%20&%20Caps"
                        />
                    </Box>

                    {/* Accessories */}
                    <ProductSection
                        title={t('home.sectionAccessories')}
                        products={getProductsByCategory("Accessories")}
                        categoryLink="/islamic-merchandise/Accessories"
                    />

                    {/* Islamic Books */}
                    <Box sx={{ bgcolor: '#f9f9f9' }}>
                        <ProductSection
                            title={t('home.sectionBooks')}
                            products={getProductsByCategory("Islamic books & Literature")}
                            categoryLink="/islamic-merchandise/Islamic%20books%20&%20Literature"
                        />
                    </Box>

                    {/* Tasbih */}
                    <ProductSection
                        title={t('home.sectionTasbih')}
                        products={getProductsByCategory("Tasbih")}
                        categoryLink="/islamic-merchandise/Tasbih"
                    />
                </>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
            `}</style>
        </Box>
    );
};

export default HomePage1;
