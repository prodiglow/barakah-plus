import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Slider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { getDuasByCategory, Dua } from "../services/duaService";
import { getAllCategories } from "../services/categoryService";

interface AudioPlayerProps {
    src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const setAudioData = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
            setCurrentTime(audio.currentTime);
        };

        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);

        // Safari often reports Infinity for duration on loadeddata
        // Use durationchange to catch when it becomes valid
        const handleDurationChange = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        audio.addEventListener("loadeddata", setAudioData);
        audio.addEventListener("loadedmetadata", setAudioData);
        audio.addEventListener("durationchange", handleDurationChange);
        audio.addEventListener("timeupdate", setAudioTime);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("canplaythrough", handleCanPlay);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("waiting", handleWaiting);
        audio.addEventListener("playing", handlePlaying);

        // Force load for Safari
        audio.load();

        return () => {
            audio.removeEventListener("loadeddata", setAudioData);
            audio.removeEventListener("loadedmetadata", setAudioData);
            audio.removeEventListener("durationchange", handleDurationChange);
            audio.removeEventListener("timeupdate", setAudioTime);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("canplaythrough", handleCanPlay);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("waiting", handleWaiting);
            audio.removeEventListener("playing", handlePlaying);
        };
    }, [src]);

    const togglePlay = async () => {
        if (!audioRef.current) return;
        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                setIsLoading(true);
                await audioRef.current.play();
                setIsPlaying(true);
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Audio playback error:", err);
            setIsPlaying(false);
            setIsLoading(false);
        }
    };

    const handleSeek = (_e: Event, newValue: number | number[]) => {
        if (!audioRef.current) return;
        const time = newValue as number;
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (time: number) => {
        if (!isFinite(time) || isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
        <Box sx={{ width: "100%", bgcolor: "black", p: 1, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <audio
                ref={audioRef}
                src={src}
                preload="auto"
                crossOrigin="anonymous"
            />
            <IconButton onClick={togglePlay} sx={{ color: "white" }} disabled={isLoading && !isPlaying}>
                {isLoading && !isPlaying ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                ) : isPlaying ? (
                    <PauseIcon />
                ) : (
                    <PlayArrowIcon />
                )}
            </IconButton>
            <Typography variant="caption" color="white" minWidth={35}>
                {formatTime(currentTime)}
            </Typography>
            <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                sx={{
                    color: "white",
                    "& .MuiSlider-thumb": { width: 0, height: 0 },
                    "& .MuiSlider-track": { height: 4 },
                    "& .MuiSlider-rail": { height: 4, opacity: 0.3 },
                }}
            />
            <Typography variant="caption" color="white" minWidth={35}>
                {formatTime(duration)}
            </Typography>
            <VolumeUpIcon sx={{ color: "white", ml: 1 }} />
        </Box>
    );
};


const CategoryDuasPage: React.FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();
    const [duas, setDuas] = useState<Dua[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState("");

    // Accordion State: using a Map to track state for each section of each dua
    // Key format: `{duaId}-{section}`
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const handleToggle = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded((prev) => ({ ...prev, [panel]: isExpanded }));
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!categoryId) return;
            try {
                setLoading(true);
                // Fetch Duas
                const duasData = await getDuasByCategory(categoryId);
                setDuas(duasData);

                // Fetch Category Title (Optional: could pass via state, but fetching ensures correctness)
                const categories = await getAllCategories();
                const currentCategory = categories.find((c: any) => c._id === categoryId);
                if (currentCategory) {
                    setCategoryTitle(currentCategory.title);
                }

                // Initialize Expanded State (All closed by default)
                const initialExpanded: Record<string, boolean> = {};
                // No need to set anything to true
                setExpanded(initialExpanded);

            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress sx={{ color: "#00BFA5" }} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#fff", minHeight: "100vh", py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box mb={4} position="relative" textAlign="center">
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ position: 'absolute', left: 0, top: 0, color: '#00BFA5' }}
                    >
                        <ArrowBackIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold" color="#00BFA5" sx={{ textTransform: 'capitalize' }}>
                        {categoryTitle || "Duas"}
                    </Typography>
                </Box>

                <Box display="flex" flexDirection="column" gap={6}>
                    {duas.map((dua) => (
                        <Box key={dua._id} id={dua._id} sx={{ mb: 4 }}>
                            {/* Title */}
                            <Typography variant="h5" fontWeight="bold" align="center" color="#00BFA5" gutterBottom>
                                {dua.title}
                            </Typography>

                            {/* Arabic Text */}
                            <Box my={3} textAlign="center" position="relative">
                                <Typography
                                    variant="h4"
                                    color="text.secondary"
                                    sx={{
                                        fontFamily: "'Amiri', serif",
                                        lineHeight: 2,
                                        textAlign: "right",
                                        direction: "rtl",
                                        mr: { xs: 0, md: 4 }
                                    }}
                                >
                                    {dua.arabic_text}
                                    <Typography
                                        component="span"
                                        variant="h5"
                                        color="text.secondary"
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '0.7em',
                                            mx: 1
                                        }}
                                    >
                                        ({dua.repeat || 1}x)
                                    </Typography>
                                </Typography>
                            </Box>

                            {/* Accordion Sections */}

                            {/* Translation */}
                            <Accordion
                                expanded={expanded[`${dua._id}-translation`] || false}
                                onChange={handleToggle(`${dua._id}-translation`)}
                                elevation={0}
                                sx={{ '&:before': { display: 'none' } }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00BFA5' }} />}>
                                    <Typography variant="h6" color="#333" fontWeight="500">Translation</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                                        {dua.translation}
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Box sx={{ borderBottom: '1px solid #eee', my: 1 }} />

                            {/* Transliteration */}
                            {dua.transliteration && (
                                <>
                                    <Accordion
                                        expanded={expanded[`${dua._id}-transliteration`] || false}
                                        onChange={handleToggle(`${dua._id}-transliteration`)}
                                        elevation={0}
                                        sx={{ '&:before': { display: 'none' } }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00BFA5' }} />}>
                                            <Typography variant="h6" color="#333" fontWeight="500">Transliteration</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body1" color="text.secondary" fontStyle="italic" lineHeight={1.6}>
                                                {dua.transliteration}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Box sx={{ borderBottom: '1px solid #eee', my: 1 }} />
                                </>
                            )}

                            {/* Virtue */}
                            {dua.virtue && (
                                <>
                                    <Accordion
                                        expanded={expanded[`${dua._id}-virtue`] || false}
                                        onChange={handleToggle(`${dua._id}-virtue`)}
                                        elevation={0}
                                        sx={{ '&:before': { display: 'none' } }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00BFA5' }} />}>
                                            <Typography variant="h6" color="#333" fontWeight="500">Virtue</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                                                {dua.virtue}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Box sx={{ borderBottom: '1px solid #eee', my: 1 }} />
                                </>
                            )}

                            {/* Explanation */}
                            {dua.explanation && (
                                <>
                                    <Accordion
                                        expanded={expanded[`${dua._id}-explanation`] || false}
                                        onChange={handleToggle(`${dua._id}-explanation`)}
                                        elevation={0}
                                        sx={{ '&:before': { display: 'none' } }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00BFA5' }} />}>
                                            <Typography variant="h6" color="#333" fontWeight="500">Explanation</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                                                {dua.explanation}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    <Box sx={{ borderBottom: '1px solid #eee', my: 1 }} />
                                </>
                            )}

                            {/* Audio */}
                            <Accordion
                                expanded={expanded[`${dua._id}-audio`] || false}
                                onChange={handleToggle(`${dua._id}-audio`)}
                                elevation={0}
                                sx={{ '&:before': { display: 'none' } }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#00BFA5' }} />}>
                                    <Typography variant="h6" color="#333" fontWeight="500">Audio</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {dua.audioUrl ? (
                                        <AudioPlayer src={dua.audioUrl} />
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">
                                            Audio not available.
                                        </Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>

                        </Box>
                    ))}

                    {duas.length === 0 && (
                        <Typography align="center" color="text.secondary">
                            No Duas found in this category.
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default CategoryDuasPage;
