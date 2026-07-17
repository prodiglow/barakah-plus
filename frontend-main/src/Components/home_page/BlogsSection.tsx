import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { blogService, BlogData } from "../../services/blogService";

const BlogsSection: React.FC = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<BlogData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await blogService.getAllBlogs();
                const allBlogs = Array.isArray(response.blogs)
                    ? response.blogs
                    : Array.isArray(response)
                        ? response
                        : [];

                // Show only published blogs, sorted newest first, limited to 4
                const publishedBlogs = allBlogs
                    .filter((b: BlogData) => b.isPublished)
                    .sort((a: BlogData, b: BlogData) =>
                        new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
                    )
                    .slice(0, 4);

                setBlogs(publishedBlogs);
            } catch (err) {
                console.error("Error fetching blogs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Strip HTML for excerpt preview
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

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress sx={{ color: "#1db954" }} />
            </Box>
        );
    }

    if (blogs.length === 0) {
        return null; // Don't render section if no blogs
    }

    return (
        <Box
            sx={{
                padding: { xs: 3, sm: 5, md: 8 },
                paddingX: { md: 12 },
                backgroundColor: "#f8faf9",
                textAlign: "center",
            }}
        >
            {/* Section Header */}
            <Typography
                variant="h3"
                gutterBottom
                fontWeight={900}
                color="textPrimary"
                sx={{
                    fontSize: { xs: "1.8rem", sm: "2.3rem", md: "2.8rem" },
                    mb: 1,
                }}
            >
                Latest from Our Blog
            </Typography>

            <Typography
                variant="h6"
                color="textSecondary"
                paragraph
                sx={{
                    fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
                    marginBottom: { xs: 4, sm: 5, md: 6 },
                    maxWidth: 700,
                    mx: "auto",
                }}
            >
                Stay updated with Islamic knowledge, spiritual guidance, and
                inspiring stories from our community.
            </Typography>

            {/* Blog Cards Grid */}
            <Grid container spacing={3} justifyContent="center">
                {blogs.map((blog) => (
                    <Grid
                        key={blog._id}
                        size={{ xs: 12, sm: 6, md: 3 }}
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
                            {/* Cover Image */}
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
                                    textAlign: "left",
                                }}
                            >
                                {/* Tags */}
                                {blog.tags && blog.tags.length > 0 && (
                                    <Box sx={{ mb: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                        {blog.tags.slice(0, 2).map((tag, idx) => (
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

                                {/* Title */}
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{
                                        fontSize: "1.05rem",
                                        lineHeight: 1.3,
                                        mb: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        color: "#1a1a1a",
                                    }}
                                >
                                    {blog.title}
                                </Typography>

                                {/* Excerpt */}
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 1.5,
                                        flexGrow: 1,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {blog.excerpt || stripHtml(blog.content).substring(0, 120)}
                                </Typography>

                                {/* Author & Date */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mt: "auto",
                                        pt: 1,
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

            {/* View All Blogs Button */}
            <Button
                variant="text"
                onClick={() => {
                    navigate("/blogs");
                    window.scrollTo(0, 0);
                }}
                color="warning"
                sx={{
                    mt: 4,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: 600,
                }}
            >
                View All Blogs →
            </Button>
        </Box>
    );
};

export default BlogsSection;
