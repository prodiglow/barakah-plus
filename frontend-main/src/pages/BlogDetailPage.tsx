import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Chip,
    CircularProgress,
    Avatar,
    Divider,
    Breadcrumbs,
    Link,
    CardMedia
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { blogService, BlogData } from "../services/blogService";

const BlogDetailPage: React.FC = () => {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();
    const [blog, setBlog] = useState<BlogData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!identifier) return;

        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError(null);

                // Assuming identifier could be a slug or an ID.
                // Depending on your backend implementation, you might need to try one then the other,
                // or have an endpoint that handles both. For now, trying by slug, fallback to ID if needed.
                let data;
                try {
                    data = await blogService.getBlogBySlug(identifier);
                } catch (e) {
                    data = await blogService.getBlogById(identifier);
                }

                if (data && data.blog) {
                    setBlog(data.blog);
                } else {
                    setError("Blog post not found.");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load blog post.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [identifier]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 15 }}>
                <CircularProgress sx={{ color: "#1db954" }} />
            </Box>
        );
    }

    if (error || !blog) {
        return (
            <Box sx={{ textAlign: "center", py: 15 }}>
                <Typography color="error" variant="h5" gutterBottom>
                    {error || "Blog post not found."}
                </Typography>
                <Typography
                    component="span"
                    sx={{ color: "#1db954", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate("/blogs")}
                >
                    Return to all blogs
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ backgroundColor: "#fdfdfd", minHeight: "100vh", pb: 10, pt: { xs: 4, md: 6 }, overflowX: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={{ width: { xs: "95%", md: "70%" }, maxWidth: "1200px" }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                    sx={{ mb: 4, ml: 1 }}
                >
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate("/blogs")}>
                        Blog
                    </Link>
                    <Typography color="text.primary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {blog.title}
                    </Typography>
                </Breadcrumbs>

                {/* Header Section */}
                <Box sx={{ mb: 4, textAlign: "center" }}>
                    {blog.tags && blog.tags.length > 0 && (
                        <Box sx={{ mb: 3, display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
                            {blog.tags.map((tag, idx) => (
                                <Chip
                                    key={idx}
                                    label={tag}
                                    sx={{
                                        backgroundColor: "#e8f5e9",
                                        color: "#2e7d32",
                                        fontWeight: 600,
                                        fontSize: "0.85rem"
                                    }}
                                />
                            ))}
                        </Box>
                    )}

                    <Typography
                        variant="h2"
                        component="h1"
                        fontWeight={900}
                        sx={{
                            fontSize: { xs: "2rem", sm: "2.8rem", md: "3.5rem" },
                            lineHeight: 1.2,
                            color: "#1a1a1a",
                            mb: 3,
                        }}
                    >
                        {blog.title}
                    </Typography>

                    {blog.excerpt && (
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: "1.1rem", md: "1.3rem" },
                                fontWeight: 400,
                                maxWidth: 700,
                                mx: "auto",
                                mb: 4,
                                lineHeight: 1.6,
                            }}
                        >
                            {blog.excerpt}
                        </Typography>
                    )}

                    {/* Author Meta */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Avatar sx={{ bgcolor: "#1db954", width: 48, height: 48 }}>
                            {blog.author ? blog.author.charAt(0).toUpperCase() : "A"}
                        </Avatar>
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1, mb: 0.5 }}>
                                {blog.author || "Baraka Plus Admin"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                {formatDate(blog.createdAt)} • {Math.ceil((blog.content.length || 0) / 1000)} min read
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Cover Image */}
            {blog.coverImage && (
                <Box sx={{ width: { xs: "95%", md: "70%" }, maxWidth: "1200px", mb: 6 }}>
                    <CardMedia
                        component="img"
                        image={blog.coverImage}
                        alt={blog.title}
                        sx={{
                            width: "100%",
                            maxHeight: { xs: 300, sm: 450, md: 550 },
                            objectFit: "cover",
                            borderRadius: 4,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        }}
                    />
                </Box>
            )}

            {/* Content Section */}
            <Box sx={{ width: { xs: "95%", md: "70%" }, maxWidth: "1200px", boxSizing: "border-box" }}>
                <Box
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.content ? blog.content.replace(/&nbsp;/g, ' ') : '' }}
                    sx={{
                        fontSize: { xs: "1.05rem", md: "1.15rem" },
                        lineHeight: 1.8,
                        color: "#333",
                        width: "100%",
                        textAlign: "justify",
                        "& *": { maxWidth: "100%" },
                        "& p": { mb: 3 },
                        "& h2": { fontSize: "2rem", fontWeight: 700, mt: 5, mb: 2, color: "#1a1a1a" },
                        "& h3": { fontSize: "1.5rem", fontWeight: 700, mt: 4, mb: 2, color: "#222" },
                        "& ul, & ol": { mb: 3, pl: 3 },
                        "& li": { mb: 1 },
                        "& img": {
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: 2,
                            my: 3,
                            mx: "auto",
                            display: "block",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                        "& a": { color: "#1db954", textDecoration: "none", "&:hover": { textDecoration: "underline" } },
                        "& blockquote": {
                            borderLeft: "4px solid #1db954",
                            pl: 3,
                            py: 1,
                            my: 4,
                            bgcolor: "#f8faf9",
                            fontStyle: "italic",
                            color: "#555",
                        },
                        "& pre": {
                            backgroundColor: "#1e1e1e",
                            color: "#fff",
                            p: 2,
                            borderRadius: 2,
                            overflowX: "auto",
                            my: 3,
                        },
                    }}
                />

                <Divider sx={{ my: 6 }} />

                {/* <Box sx={{ textAlign: "center", pb: 4 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Share this post
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=${encodeURIComponent(blog.title)}`, '_blank')}
                            sx={{ color: "#1DA1F2", borderColor: "#1DA1F2", borderRadius: 20 }}
                        >
                            Twitter
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                            sx={{ color: "#4267B2", borderColor: "#4267B2", borderRadius: 20 }}
                        >
                            Facebook
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${blog.title} - ${window.location.href}`)}`, '_blank')}
                            sx={{ color: "#25D366", borderColor: "#25D366", borderRadius: 20 }}
                        >
                            WhatsApp
                        </Button>
                    </Box>
                </Box> */}
            </Box>
        </Box>
    );
};

export default BlogDetailPage;
