import { Request, Response } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { Order } from "../models/Orders";

// 📌 Get scholar chat from relevant order
export const getScholarChat = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { scholarId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find the order to verify it exists and get scholar ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If scholarId is provided in query, verify it matches the order's scholar
    if (scholarId && order.ScholarID.toString() !== scholarId) {
      return res.status(403).json({ message: "Unauthorized: This order does not belong to this scholar" });
    }

    // Find conversation for this order where scholar is a participant
    const conversation = await Conversation.findOne({
      orderId: orderId,
      participants: { $in: [order.ScholarID] },
    })
      .populate("participants", "name email scholarName")
      .populate("orderId", "OrderTitle Status");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found for this order" });
    }

    // Get all messages for this conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .populate("sender", "name email scholarName")
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)

    res.status(200).json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching scholar chat:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

