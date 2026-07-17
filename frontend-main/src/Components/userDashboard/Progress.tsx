import React, { useEffect, useState, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Link,
} from "@mui/material";
import { styled } from "@mui/system";
import { getUserConversations, getUserChat } from "../../services/userConversationService";
import { submitFeedback, maxPopupCount, incrementPopupCount } from "../../services/orderService";
import FeedbackPopup from "./FeedbackPopup";
import { Message as ApiMessage } from "../../types/userConversation";

interface DisplayMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  audioUrl?: string;
  createdAt: string;
}

interface OrderConversation {
  orderId: string;
  orderTitle: string;
  orderStatus: string;
  orderID: number;
  scholarName?: string;

  feedbackGiven?: boolean;
  feedbackPopupCount?: number;
  messages: DisplayMessage[];
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

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const [orderConversations, setOrderConversations] = useState<OrderConversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Popup State
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<OrderConversation | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Check for feedback opportunities on load
  useEffect(() => {
    if (loading || orderConversations.length === 0) return;

    // Find first order that is Completed, hasn't given feedback, and popup count < 3
    // We prioritize the most recent one (assuming orderConversations is already sorted by date usually, or we pick first found)
    const candidate = orderConversations.find(o =>
      o.orderStatus === "Completed" &&
      !o.feedbackGiven &&
      (typeof o.feedbackPopupCount === 'number' ? o.feedbackPopupCount < 3 : true)
    );

    if (candidate) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setActiveFeedbackOrder(candidate);
        setFeedbackOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, orderConversations]); // Run when conversations are loaded

  // Called when user clicks "X" or outside (Increment Count)
  const handleFeedbackClose = async () => {
    if (activeFeedbackOrder) {
      // Increment popup count in backend
      try {

        await incrementPopupCount(activeFeedbackOrder.orderId);

      } catch (err) {
        console.error("Failed to increment popup count:", err);
      }
    }
    setFeedbackOpen(false);
    setActiveFeedbackOrder(null);
  };

  // Called when user clicks "Maybe Later" (Max Out Count)
  const handleFeedbackDismiss = async () => {
    if (activeFeedbackOrder) {
      // Max out popup count in backend (set to 3 so it doesn't show again)
      try {

        await maxPopupCount(activeFeedbackOrder.orderId);

      } catch (err) {
        console.error("Failed to max out popup count:", err);
      }
    }
    setFeedbackOpen(false);
    setActiveFeedbackOrder(null);
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!activeFeedbackOrder) return;

    await submitFeedback(activeFeedbackOrder.orderId, rating, comment);

    // Update local state to reflect feedback given
    setOrderConversations(prev => prev.map(o =>
      o.orderId === activeFeedbackOrder.orderId
        ? { ...o, feedbackGiven: true }
        : o
    ));

    setFeedbackOpen(false);
    setActiveFeedbackOrder(null);
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("❌ No userId found in localStorage!");
          setLoading(false);
          return;
        }

        const response = await getUserConversations(userId);

        if (response.conversations && response.conversations.length > 0) {
          // Fetch all messages for each conversation and group by order
          const conversationPromises = response.conversations.map(async (conversation) => {
            try {
              const chatResponse = await getUserChat(conversation.orderId._id, userId);

              // Filter to only include "user" and "adminToUser" messages
              const filteredMessages = chatResponse.messages
                .filter((msg: ApiMessage) => msg.type === "user" || msg.type === "adminToUser")
                .sort((a: ApiMessage, b: ApiMessage) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
                .map((msg: ApiMessage): DisplayMessage => ({
                  id: msg._id,
                  sender: (msg.type === "user" ? "user" : "support") as "user" | "support",
                  text: msg.text,
                  audioUrl: msg.audioUrl,
                  createdAt: msg.createdAt,
                }));

              return {
                orderId: conversation.orderId._id,
                orderTitle: conversation.orderId.OrderTitle,
                orderStatus: conversation.orderId.Status,
                orderID: conversation.orderId.OrderID,
                // @ts-ignore
                feedbackGiven: conversation.orderId.feedbackGiven,
                // @ts-ignore
                feedbackPopupCount: conversation.orderId.feedbackPopupCount,
                // Extract scholar name
                // @ts-ignore
                scholarName: conversation.participants?.find((p: any) => p.scholarName)?.scholarName,
                messages: filteredMessages,
              } as OrderConversation;
            } catch (error) {
              console.error(`❌ Error fetching chat for order ${conversation.orderId._id}:`, error);
              return {
                orderId: conversation.orderId._id,
                orderTitle: conversation.orderId.OrderTitle,
                orderStatus: conversation.orderId.Status,
                orderID: conversation.orderId.OrderID,
                messages: [],
              } as OrderConversation;
            }
          });

          // Wait for all conversations to be fetched
          const orderConversationsData = await Promise.all(conversationPromises);

          // Filter out orders with no messages (optional - you can remove this if you want to show empty orders too)
          const ordersWithMessages = orderConversationsData.filter(
            (order) => order.messages.length > 0
          );

          setOrderConversations(ordersWithMessages);
        } else {
          setOrderConversations([]);
        }
      } catch (error) {
        console.error("❌ Error fetching user conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Mark completed orders as read
    const markRead = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const { markCompletedOrdersRead } = await import("../../services/orderService");
        await markCompletedOrdersRead(userId);
        // Dispatch event to update Header and Dashboard badges
        window.dispatchEvent(new Event("unreadCountUpdated"));
      } catch (error) {
        console.error("Failed to mark read", error);
      }
    };
    markRead();

  }, []);
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (status: string): "success" | "primary" | "warning" | "info" | "error" | "default" => {
    if (status === "Completed") return "success";
    if (status && status.toLowerCase().includes("rejected")) return "error";
    return "default"; // Will be overridden to Amber
  };

  const renderMessageText = (text: string) => {
    const linkText = "Link to the guideline";
    const parts: (string | ReactElement)[] = [];
    let lastIndex = 0;
    let searchIndex = 0;

    while ((searchIndex = text.indexOf(linkText, lastIndex)) !== -1) {
      // Add text before the link
      if (searchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, searchIndex));
      }

      // Add the clickable link
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
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {linkText}
        </Link>
      );

      lastIndex = searchIndex + linkText.length;
    }

    // Add remaining text after the last link
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // If no links were found, return the original text
    if (parts.length === 0) {
      return <>{text}</>;
    }

    return <>{parts}</>;
  };

  return (
    <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center" gap={3}>
      {orderConversations.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            width: "95%",
            backgroundColor: "#fff",
            p: 3,
            borderRadius: 3,
            boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            No messages yet. Start a conversation!
          </Typography>
        </Paper>
      ) : (
        orderConversations.map((orderConv) => (
          <Paper
            key={orderConv.orderId}
            elevation={3}
            sx={{
              width: "95%",
              backgroundColor: "#fff",
              p: 3,
              borderRadius: 3,
              boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
            }}
          >
            {/* Order Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
                gap: 1,
                pb: 2,
                borderBottom: "2px solid #e8f0f3",
              }}
            >
              <Avatar sx={{ bgcolor: "#e8f0f3", width: 30, height: 30 }}>S</Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Order #{orderConv.orderID}: {orderConv.orderTitle}
              </Typography>
              <Chip
                label={orderConv.orderStatus}
                color={getStatusColor(orderConv.orderStatus)}
                size="small"
                sx={{
                  ml: 1,
                  fontWeight: 500,
                  ...(orderConv.orderStatus !== "Completed" && !orderConv.orderStatus.toLowerCase().includes("rejected") && {
                    bgcolor: "#FFBF00",
                    color: "white"
                  })
                }}
              />

              {/* Leave Feedback Button (Manual Trigger) */}
              {orderConv.orderStatus === "Completed" && !orderConv.feedbackGiven && (
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  sx={{ ml: "auto" }}
                  onClick={() => {
                    setActiveFeedbackOrder(orderConv);
                    setFeedbackOpen(true);
                  }}
                >
                  Leave Feedback
                </Button>
              )}
            </Box>

            {/* Chat messages for this order */}
            <Box>
              {orderConv.messages.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                  No messages for this order yet.
                </Typography>
              ) : (
                orderConv.messages.map((msg) => {
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
                      {/* 🧍 USER MESSAGE (Left) */}
                      {!isSupport && (
                        <Box
                          sx={{
                            width: { xs: "60%", sm: "60%", md: "50%" },
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {/* Text message */}
                          {msg.text && (
                            <Paper
                              sx={{
                                p: 2,
                                backgroundColor: "#f5f6f7",
                                borderRadius: 2,
                                border: "1px solid #e6e6e6",
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                {msg.text}
                              </Typography>
                            </Paper>
                          )}

                          {/* Audio - no box, just audio bar */}
                          {msg.audioUrl && (
                            <AudioWrapper>
                              <audio controls style={{ width: "100%", height: "32px" }}>
                                <source src={msg.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </AudioWrapper>
                          )}
                        </Box>
                      )}

                      {/* 🧕 SUPPORT MESSAGE (Right-aligned with avatar) */}
                      {isSupport && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            justifyContent: "flex-end",
                            gap: 1.5, // space between message and avatar
                            width: "100%", // push both to the right
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: "60%", sm: "60%", md: "50%" },
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {/* Text message */}
                            {msg.text && (
                              <Paper
                                elevation={2}
                                sx={{
                                  p: 2,
                                  backgroundColor: "#f5f6f7",
                                  borderRadius: 2,
                                  border: "1px solid #e6e6e6",
                                }}
                              >
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                                  {renderMessageText(msg.text)}
                                </Typography>

                                {/* Confirm Changes Button inside message box - only show when message contains "Link to the guideline" AND order is not completed */}
                                {(msg.text.toLowerCase().includes("link to the guidline") || msg.text.toLowerCase().includes("link to the guideline")) && orderConv.orderStatus !== "Completed" ? (
                                  <ConfirmButton
                                    variant="contained"
                                    sx={{
                                      mt: 2,
                                      width: "100%",
                                    }}
                                    onClick={() => {
                                      // Navigate to order details page
                                      navigate(`/user/dashboard/orders/${orderConv.orderId}`, { state: { isEditable: true } });
                                      // Scroll to top when navigating to order details
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                  >
                                    Update Your Request Details
                                  </ConfirmButton>
                                ) : null}
                              </Paper>
                            )}

                            {/* Audio - no box, just audio bar */}
                            {msg.audioUrl && (
                              <audio controls style={{ width: "100%" }}>
                                <source src={msg.audioUrl} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                          </Box>

                          {/* 👤 Avatar aligned on same row, right side */}
                          <Avatar
                            sx={{
                              bgcolor: "#e8f0f3",
                              color: "black",
                              width: 32,
                              height: 32,
                              mt: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            S
                          </Avatar>
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Paper>
        ))
      )}
      {/* Feedback Popup */}
      <FeedbackPopup
        open={feedbackOpen}
        onClose={handleFeedbackClose}
        onDismiss={handleFeedbackDismiss}
        onSubmit={handleFeedbackSubmit}
        order={activeFeedbackOrder ? {
          OrderID: activeFeedbackOrder.orderID,
          OrderTitle: activeFeedbackOrder.orderTitle,
          _id: activeFeedbackOrder.orderId,
          scholarName: activeFeedbackOrder.scholarName
        } : null}
      />
    </Box>
  );
};

export default Progress;
