import React, { useEffect, useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Button,
    Link,
} from "@mui/material";
import { styled } from "@mui/system";
import { getUserChat } from "../../services/userConversationService";
import { submitFeedback } from "../../services/orderService";
import FeedbackPopup from "./FeedbackPopup";
import { Message as ApiMessage } from "../../types/userConversation";

interface OrderChatProps {
    orderId: string;
    orderTitle: string;
    orderStatus: string;
    orderID: number;
}

interface DisplayMessage {
    id: string;
    sender: "user" | "support";
    text: string;
    audioUrl?: string;
    createdAt: string;
}

const ConfirmButton = styled(Button)({
    color: "#fff",
    display: "flex",
    marginTop: "12px",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
        scale: 1.05,
    },
    backgroundColor: "#F69320",
});

const AudioWrapper = styled(Box)({
    width: "100%",
    height: "32px",
    display: "flex",
    alignItems: "center",
    "& audio": {
        width: "100%",
        height: "32px",
        "&::-webkit-media-controls-panel": {
            height: "32px",
        },
    },
});

const OrderChat: React.FC<OrderChatProps> = ({ orderId, orderTitle, orderStatus, orderID }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [loading, setLoading] = useState(true);

    // Feedback Popup State
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false); // Local state for this session

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const userId = localStorage.getItem("userId");
                if (!userId) {
                    setLoading(false);
                    return;
                }

                const chatResponse = await getUserChat(orderId, userId);

                if (chatResponse && chatResponse.messages) {
                    const filteredMessages = chatResponse.messages
                        .filter((msg: ApiMessage) => msg.type === "user" || msg.type === "adminToUser")
                        .sort((a: ApiMessage, b: ApiMessage) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        )
                        .map((msg: ApiMessage): DisplayMessage => ({
                            id: msg._id,
                            sender: (msg.type === "user" ? "user" : "support") as "user" | "support",
                            text: msg.text,
                            audioUrl: msg.audioUrl,
                            createdAt: msg.createdAt,
                        }));
                    setMessages(filteredMessages);

                    // Should verify feedback status if needed, but for now simplify
                }
            } catch (error) {
                console.error("Error fetching chat:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChat();
    }, [orderId]);

    const handleFeedbackSubmit = async (rating: number, comment: string) => {
        await submitFeedback(orderId, rating, comment);
        setFeedbackGiven(true);
        setFeedbackOpen(false);
    };

    const renderMessageText = (text: string) => {
        const linkText = "Link to the guideline";
        const parts: (string | ReactElement)[] = [];
        let lastIndex = 0;
        let searchIndex = 0;

        while ((searchIndex = text.indexOf(linkText, lastIndex)) !== -1) {
            if (searchIndex > lastIndex) {
                parts.push(text.substring(lastIndex, searchIndex));
            }
            parts.push(
                <Link
                    key={searchIndex}
                    component="button"
                    variant="body2"
                    onClick={() => navigate("/home-baraka")}
                    sx={{
                        color: "#1976d2",
                        textDecoration: "underline",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    {linkText}
                </Link>
            );
            lastIndex = searchIndex + linkText.length;
        }
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        if (parts.length === 0) return <>{text}</>;
        return <>{parts}</>;
    };

    if (loading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={20} /></Box>;

    return (
        <Box sx={{ p: 2, bgcolor: "#f9f9f9", borderRadius: 2, mt: 1 }}>
            {/* Simple Feedback Button if applicable */}
            {
                orderStatus === "Completed" && !feedbackGiven && (
                    <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        sx={{ mb: 2, ml: "auto", display: "flex" }}
                        onClick={() => setFeedbackOpen(true)}
                    >
                        Leave Feedback
                    </Button>
                )
            }

            {/* Chat messages */},
            <Box>
                {messages.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                        No messages for this order yet.
                    </Typography>
                ) : (
                    messages.map((msg) => {
                        const isSupport = msg.sender === "support";
                        return (
                            <Box
                                key={msg.id}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: isSupport ? "flex-end" : "flex-start",
                                    mb: 2,
                                    alignItems: "flex-start",
                                }}
                            >
                                {!isSupport && (
                                    <Box sx={{ width: { xs: "80%", md: "60%" }, display: "flex", flexDirection: "column", gap: 1 }}>
                                        {msg.text && (
                                            <Paper sx={{ p: 2, backgroundColor: "#fff", borderRadius: 2 }}>
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{msg.text}</Typography>
                                            </Paper>
                                        )}
                                        {msg.audioUrl && (
                                            <AudioWrapper>
                                                <audio controls style={{ width: "100%", height: "32px" }}>
                                                    <source src={msg.audioUrl} type="audio/mpeg" />
                                                </audio>
                                            </AudioWrapper>
                                        )}
                                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-end", mt: 0.5 }}>
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                )}

                                {isSupport && (
                                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, width: "100%" }}>
                                        <Box sx={{ width: { xs: "80%", md: "60%" }, display: "flex", flexDirection: "column", gap: 1 }}>
                                            {msg.text && (
                                                <Paper elevation={1} sx={{ p: 2, backgroundColor: "#e3f2fd", borderRadius: 2 }}>
                                                    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{renderMessageText(msg.text)}</Typography>
                                                    {(msg.text.toLowerCase().includes("link to the guidline") || msg.text.toLowerCase().includes("link to the guideline")) && orderStatus === "User Review Requested" ? (
                                                        <ConfirmButton
                                                            variant="contained"
                                                            onClick={() => {
                                                                navigate(`/user/dashboard/orders/${orderId}`, { state: { isEditable: true } });
                                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                                            }}
                                                        >
                                                            Update Your Request Details
                                                        </ConfirmButton>
                                                    ) : null}
                                                </Paper>
                                            )}
                                            {msg.audioUrl && (
                                                <audio controls style={{ width: "100%" }}>
                                                    <source src={msg.audioUrl} type="audio/mpeg" />
                                                </audio>
                                            )}
                                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: "#1976d2", width: 32, height: 32, mt: 0.5 }}>S</Avatar>
                                    </Box>
                                )
                                }
                            </Box>
                        );
                    })
                )}
            </Box>



            <FeedbackPopup
                open={feedbackOpen}
                onClose={() => setFeedbackOpen(false)}
                onDismiss={() => setFeedbackOpen(false)}
                onSubmit={handleFeedbackSubmit}
                order={{ OrderID: orderID, OrderTitle: orderTitle, _id: orderId }}
            />
        </Box >
    );
};

export default OrderChat;
