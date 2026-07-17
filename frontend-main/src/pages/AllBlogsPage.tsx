import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Typography,
    Pagination,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { blogService, BlogData } from "../services/blogService";

const AllBlogsPage: React.FC = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<BlogData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const blogsPerPage = 8;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await blogService.getAllBlogs();
                const allBlogs = Array.isArray(response.blogs) ? response.blogs : [];

                const publishedBlogs = allBlogs
                    .filter((b) => b.isPublished)
                    .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());

                setBlogs(publishedBlogs);
            } catch (err) {
                console.error(err);
                setError("Failed to load blogs.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const stripHtml = (html: string) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleBlogClick = (blog: BlogData) => {
        navigate(`/blogs/${blog.slug || blog._id}`);
        window.scrollTo(0, 0);
    };

    const startIndex = (page - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    const paginatedBlogs = blogs.slice(startIndex, endIndex);
    const totalPages = Math.ceil(blogs.length / blogsPerPage);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress sx={{ color: "#1db954" }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                padding: { xs: 3, sm: 5 },
                px: { md: 10 },
                marginTop: { xs: 8, sm: 8, md: 0 },
                backgroundColor: "#f8faf9",
                minHeight: "80vh",
            }}
        >
            <Typography
                variant="h3"
                gutterBottom
                fontWeight={900}
                color="textPrimary"
                align="center"
                sx={{
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                    mb: 2,
                }}
            >
                Our Blog
            </Typography>
            <Typography
                variant="h6"
                marginBottom={8}
                color="textSecondary"
                align="center"
                paragraph
                sx={{
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                    maxWidth: 800,
                    mx: "auto",
                }}
            >
                Explore articles, insights, and spiritual guidance to enhance your journey.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {paginatedBlogs.map((blog) => (
                    <Grid
                        key={blog._id}
                        size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                        sx={{ display: "flex", justifyContent: "center" }}
                    >
                        <Card
                            onClick={() => handleBlogClick(blog)}
                            sx={{
                                width: "100%",
                                maxWidth: 380,
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 3,
                                cursor: "pointer",
                                overflow: "hidden",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                                },
                            }}
                        >
                            {blog.coverImage ? (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={blog.coverImage}
                                    alt={blog.title}
                                    sx={{ objectFit: "cover" }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        height: 200,
                                        background: "linear-gradient(135deg, #1db954 0%, #11998e 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography variant="h4" sx={{ color: "white", opacity: 0.5 }}>
                                        📝
                                    </Typography>
                                </Box>
                            )}

                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    p: 2.5,
                                }}
                            >
                                {blog.tags && blog.tags.length > 0 && (
                                    <Box sx={{ mb: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                        {blog.tags.slice(0, 3).map((tag, idx) => (
                                            <Chip
                                                key={idx}
                                                label={tag}
                                                size="small"
                                                sx={{
                                                    fontSize: "0.7rem",
                                                    height: 22,
                                                    backgroundColor: "#e8f5e9",
                                                    color: "#2e7d32",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                        fontSize: "1.1rem",
                                        lineHeight: 1.3,
                                        mb: 1.5,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        color: "#1a1a1a",
                                    }}
                                >
                                    {blog.title}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                        flexGrow: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {blog.excerpt || stripHtml(blog.content).substring(0, 150) + "..."}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mt: "auto",
                                        pt: 2,
                                        borderTop: "1px solid #f0f0f0",
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        {blog.author}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(blog.createdAt)}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Box sx={{ mt: 8, mb: 4, display: "flex", justifyContent: "center" }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => {
                            setPage(value);
                            window.scrollTo(0, 0);
                        }}
                        size="large"
                        sx={{
                            "& .MuiPaginationItem-root": {
                                color: "#2e7d32",
                                fontWeight: 500,
                            },
                            "& .MuiPaginationItem-root.Mui-selected": {
                                backgroundColor: "#1db954",
                                color: "white",
                                "&:hover": {
                                    backgroundColor: "#11998e",
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default AllBlogsPage;
