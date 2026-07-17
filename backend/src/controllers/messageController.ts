import { Request, Response } from "express";
import Message from "../models/Message";
import Conversation from "../models/Conversation";

// 📌 Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, sender, text, audioUrl, type } = req.body;

    if (!conversationId || !sender || !type) {
      return res.status(400).json({ message: "conversationId, sender, and type are required" });
    }

    // Validate message type
    if (!["user", "adminToScholar","adminToUser", "scholar"].includes(type)) {
      return res.status(400).json({ message: "type must be 'user', 'admin', or 'scholar'" });
    }

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify sender is a participant in the conversation
    const senderId = sender.toString();
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderId
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        message: "Unauthorized: Sender must be a participant in this conversation" 
      });
    }

    // Validate that at least text or audioUrl is provided
    if (!text && !audioUrl) {
      return res.status(400).json({ message: "Either text or audioUrl must be provided" });
    }

    const message = await Message.create({
      conversationId,
      sender,
      text,
      audioUrl,
      type,
    });

    // Populate sender information for response
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email scholarName")
      .populate("conversationId");

    // 🚀 Update Order Status if message is from scholar
    if (type === "scholar") {
      console.log("🚀 Processing Scholar Reply... Attempting to update status.");
      try {
        // Find order ID from conversation
        // conversation variable already fetched above
        if (conversation && conversation.orderId) {
             console.log(`✅ Conversation found with OrderID: ${conversation.orderId}`);
             const { Order } = require("../models/Orders"); // Dynamic import to avoid circular dependency
             const updated = await Order.findByIdAndUpdate(conversation.orderId, {
               Status: "Scholar Submitted – Pending Review"
             });
             console.log(`✅ Update Result:`, updated ? "Success" : "Order not found");
        } else {
             console.log("❌ Conversation or OrderID missing in conversation object", conversation);
        }
      } catch (statusError) {
        console.error("❌ Error updating order status upon scholar reply:", statusError);
        // Don't fail the message sending if status update fails, but log it
      }
    }

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

