import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { pageService, PageData } from '../services/pageService';

/**
 * Renders a single CMS-managed page (About Us, FAQ, policies, etc.) by slug.
 * Route: /pages/:slug — see AppRoutes.tsx.
 */
const CmsPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        pageService
            .getPageBySlug(slug)
            .then(setPage)
            .catch(() => setError('Page not found.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
                <CircularProgress sx={{ color: '#1db954' }} />
            </Box>
        );
    }

    if (error || !page) {
        return (
            <Box sx={{ textAlign: 'center', py: 15 }}>
                <Typography color="error" variant="h5">
                    {error || 'Page not found.'}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 3, md: 0 }, py: { xs: 6, md: 8 } }}>
            <Typography variant="h3" fontWeight={800} gutterBottom>
                {page.title}
            </Typography>
            <Box
                dangerouslySetInnerHTML={{ __html: page.content }}
                sx={{
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                    color: '#333',
                    '& p': { mb: 2 },
                    '& img': { maxWidth: '100%', height: 'auto' },
                }}
            />
        </Box>
    );
};

export default CmsPage;
