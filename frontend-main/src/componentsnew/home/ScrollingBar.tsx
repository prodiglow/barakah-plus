import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const TypingBar: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const fullText = t('promo.announcement');
    const [displayedText, setDisplayedText] = useState("");
    const [showLink, setShowLink] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        let typingInterval: ReturnType<typeof setTimeout> | null = null;
        let resetTimeout: ReturnType<typeof setTimeout> | null = null;
        let currentIndex = 0;

        const startTyping = () => {
            currentIndex = 0;
            setDisplayedText("");
            setShowLink(false);
            setIsWaiting(false);

            typingInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    setDisplayedText(fullText.substring(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    if (typingInterval) clearInterval(typingInterval);
                    setShowLink(true);
                    setIsWaiting(true);

                    // Wait 10 seconds before restarting
                    resetTimeout = setTimeout(() => {
                        startTyping();
                    }, 10000);
                }
            }, 100); // Typing speed
        };

        startTyping();

        return () => {
            if (typingInterval) clearInterval(typingInterval);
            if (resetTimeout) clearTimeout(resetTimeout);
        };
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#1db954',
                color: 'white',
                minHeight: '40px', // Prevent layout shift
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 1,
                position: 'relative',
                zIndex: 1202,
            }}
        >
            <Typography variant="body2" component="div" fontWeight="bold" sx={{ textAlign: 'center' }}>
                {displayedText}
                {showLink && (
                    <Box
                        component="span"
                        onClick={() => navigate('/shop-islamic')}
                        sx={{
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            ml: 1,
                            fontWeight: 'bold',
                            opacity: 1,
                            transition: 'opacity 0.5s ease-in',
                            '&:hover': { color: '#e0e0e0' }
                        }}
                    >
                        {t('common.shopNow')}
                    </Box>
                )}
                {/* Blinking Cursor */}
                {!isWaiting && (
                    <Box
                        component="span"
                        sx={{
                            display: 'inline-block',
                            width: '2px',
                            height: '1em',
                            bgcolor: 'white',
                            ml: 0.5,
                            verticalAlign: 'middle',
                            animation: 'blink 1s step-end infinite',
                            '@keyframes blink': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0 },
                            },
                        }}
                    />
                )}
            </Typography>
        </Box>
    );
};

export default TypingBar;
