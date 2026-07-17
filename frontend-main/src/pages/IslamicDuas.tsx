import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CircularProgress,
    Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../services/categoryService";
import { Category } from "../services/duaService";

// Extend frontend Category interface to include _id if it's missing in duaService
interface CategoryWithId extends Category {
    _id: string;
}

const IslamicDuas: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<CategoryWithId[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                // Cast to CategoryWithId as backend returns _id
                setCategories(data as unknown as CategoryWithId[]);
            } catch (error) {
                console.error("Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);


    const renderCategoryCard = (category: CategoryWithId) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={category._id}>
            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    textAlign: "center",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 2,
                    border: "1px solid #E0F2F1",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 25px rgba(0, 191, 165, 0.2)",
                        border: "1px solid #00BFA5",
                    },
                }}
                onClick={() => navigate(`/islamic-duas/${category._id}`)}
            >
                <Box
                    sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        backgroundColor: "#F5F7FA",
                        borderRadius: 3,
                        overflow: 'hidden'
                    }}
                >
                    {category.image ? (
                        <Avatar
                            src={category.image}
                            variant="square"
                            sx={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        // Fallback icon or placeholder if no image
                        <Typography variant="h4" color="text.secondary">
                            {category.title.charAt(0)}
                        </Typography>
                    )}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">
                    {category.title}
                </Typography>
            </Card>
        </Grid>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress sx={{ color: "#00BFA5" }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                backgroundColor: "#fff",
                minHeight: "100vh",
                py: 4,
            }}
        >
            <Container maxWidth="xl">
                {/* Main Heading */}
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{
                        color: "#00BFA5",
                        mb: 4,
                        textAlign: "center"
                    }}
                >
                    Dhikr & Du’a
                </Typography>

                {/* Categories Grid */}
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#00BFA5", mb: 3 }}
                >
                    Categories
                </Typography>
                <Grid container spacing={3} mb={6}>
                    {categories.map((category) => renderCategoryCard(category))}
                </Grid>

            </Container>
        </Box>
    );
};

export default IslamicDuas;
