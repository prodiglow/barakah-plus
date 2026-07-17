import { Request, Response } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import { Order } from "../models/Orders";
import User from "../models/User";
import Admin from "../models/Admin";
import { Scholar } from "../models/Scholar";

// 📌 Get user chat from relevant order
export const getUserChat = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find the order to verify it exists and get user ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If userId is provided in query, verify it matches the order's user
    if (userId && order.UserID.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: This order does not belong to this user" });
    }

    // Find conversation for this order where user is a participant
    const conversationDoc = await Conversation.findOne({
      orderId: orderId,
      participants: { $in: [order.UserID] },
    }).populate("orderId", "OrderTitle Status feedbackGiven feedbackPopupCount isEventCreated selectWazifa quranKhawaniDate quranKhawaniTimeSlot featureOnHomePage");

    if (!conversationDoc) {
      return res.status(404).json({ message: "Conversation not found for this order" });
    }

    // Manually populate participants (can be User, Admin, or Scholar)
    const populatedParticipants = await Promise.all(
      (conversationDoc.participants || []).map(async (participantId): Promise<any> => {
        // Try User
        const userParticipant = await User.findById(participantId).select("name email phone profilePic").lean();
        if (userParticipant) return { ...userParticipant, type: "user" };
        // Try Admin
        const adminParticipant = await Admin.findById(participantId).select("name email").lean();
        if (adminParticipant) return { ...adminParticipant, type: "admin" };
        // Try Scholar
        const scholarParticipant = await Scholar.findById(participantId).select("scholarName scholarID rating fee ProfileImg").lean();
        if (scholarParticipant) return { ...scholarParticipant, type: "scholar" };
        return null;
      })
    );

    const conversation = {
      ...conversationDoc.toObject(),
      participants: populatedParticipants.filter((p) => p !== null),
    };

    // Get all messages for this conversation (includes both user and scholar messages)
    const messages = await Message.find({ conversationId: conversation._id })
      .populate("sender", "name email scholarName") // Include scholarName for scholar messages
      .sort({ createdAt: 1 }); // Sort by creation time (oldest first)

    res.status(200).json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching user chat:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get all conversations for all orders of a user
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find all orders for this user
    const orders = await Order.find({ UserID: userId }).select("_id OrderTitle Status OrderID");

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: "No orders found for this user",
        conversations: [],
      });
    }

    // Get all order IDs
    const orderIds = orders.map((order) => order._id);

    // Find all conversations for these orders where user is a participant
    const conversationsRaw = await Conversation.find({
      orderId: { $in: orderIds },
      participants: { $in: [userId] },
    })
      .populate("orderId", "OrderTitle Status OrderID feedbackGiven feedbackPopupCount isReadByUser isEventCreated selectWazifa quranKhawaniDate quranKhawaniTimeSlot featureOnHomePage")
      .sort({ createdAt: -1 });

    // Populate participants and get latest message
    const conversationsWithLatestMessage = await Promise.all(
      conversationsRaw.map(async (conversation) => {
        // Manually populate participants
        const populatedParticipants = await Promise.all(
          (conversation.participants || []).map(async (participantId): Promise<any> => {
            const userParticipant = await User.findById(participantId).select("name email phone profilePic").lean();
            if (userParticipant) return { ...userParticipant, type: "user" };

            const adminParticipant = await Admin.findById(participantId).select("name email").lean();
            if (adminParticipant) return { ...adminParticipant, type: "admin" };

            const scholarParticipant = await Scholar.findById(participantId).select("scholarName scholarID rating fee ProfileImg").lean();
            if (scholarParticipant) return { ...scholarParticipant, type: "scholar" };
            return null;
          })
        );

        const latestMessage = await Message.findOne({
          conversationId: conversation._id,
        })
          .populate("sender", "name email scholarName")
          .sort({ createdAt: -1 })
          .limit(1);

        return {
          ...conversation.toObject(),
          participants: populatedParticipants.filter((p) => p !== null),
          latestMessage: latestMessage || null,
        };
      })
    );

    res.status(200).json({
      message: "Conversations retrieved successfully",
      count: conversationsWithLatestMessage.length,
      conversations: conversationsWithLatestMessage,
    });
  } catch (error) {
    console.error("❌ Error fetching user conversations:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get all orders with conversations for all users (OPTIMIZED)
export const getAllOrdersWithConversations = async (req: Request, res: Response) => {
  try {
    // Get all conversations with order data populated
    const conversations = await Conversation.find()
      .populate({
        path: "orderId",
        select: "OrderTitle Status OrderID UserID ScholarID OrderAmt PaymentStatus motherName Sect Reason PrefferedLanguage gender createdAt ScholarHadiyapaid isReadByAdmin isEventCreated selectWazifa quranKhawaniDate quranKhawaniTimeSlot featureOnHomePage",
        populate: [
          {
            path: "UserID",
            select: "name email phone profilePic",
          },
          {
            path: "ScholarID",
            select: "scholarName scholarID rating fee ProfileImg",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!conversations || conversations.length === 0) {
      return res.status(200).json({
        message: "No conversations found",
        count: 0,
        ordersWithConversations: [],
      });
    }

    // OPTIMIZATION: Collect all unique participant IDs across all conversations
    const allParticipantIds = new Set<string>();
    conversations.forEach(conv => {
      (conv.participants || []).forEach((id: any) => allParticipantIds.add(id.toString()));
    });
    const participantIdsArray = Array.from(allParticipantIds);

    // OPTIMIZATION: Batch fetch all participants from each collection in parallel
    const [allUsers, allAdmins, allScholars] = await Promise.all([
      User.find({ _id: { $in: participantIdsArray } }).select("name email phone profilePic").lean(),
      Admin.find({ _id: { $in: participantIdsArray } }).select("name email").lean(),
      Scholar.find({ _id: { $in: participantIdsArray } }).select("scholarName scholarID rating fee ProfileImg").lean(),
    ]);

    // Create lookup maps for O(1) access
    const userMap = new Map(allUsers.map(u => [u._id.toString(), { ...u, type: "user" }]));
    const adminMap = new Map(allAdmins.map(a => [a._id.toString(), { ...a, type: "admin" }]));
    const scholarMap = new Map(allScholars.map(s => [s._id.toString(), { ...s, type: "scholar" }]));

    // OPTIMIZATION: Get all conversation IDs and fetch ALL messages in one query
    const conversationIds = conversations.map(c => c._id);
    const allMessages = await Message.find({
      conversationId: { $in: conversationIds }
    })
      .sort({ createdAt: 1 })
      .lean();

    // OPTIMIZATION: Collect all unique sender IDs from messages
    const allSenderIds = new Set<string>();
    allMessages.forEach(msg => {
      if (msg.sender) allSenderIds.add(msg.sender.toString());
    });
    const senderIdsArray = Array.from(allSenderIds);

    // OPTIMIZATION: Batch fetch all senders (those not already fetched)
    const newSenderIds = senderIdsArray.filter(id => 
      !userMap.has(id) && !adminMap.has(id) && !scholarMap.has(id)
    );

    if (newSenderIds.length > 0) {
      const [newUsers, newAdmins, newScholars] = await Promise.all([
        User.find({ _id: { $in: newSenderIds } }).select("name email phone profilePic").lean(),
        Admin.find({ _id: { $in: newSenderIds } }).select("name email").lean(),
        Scholar.find({ _id: { $in: newSenderIds } }).select("scholarName scholarID rating fee ProfileImg").lean(),
      ]);

      newUsers.forEach(u => userMap.set(u._id.toString(), { ...u, type: "user" }));
      newAdmins.forEach(a => adminMap.set(a._id.toString(), { ...a, type: "admin" }));
      newScholars.forEach(s => scholarMap.set(s._id.toString(), { ...s, type: "scholar" }));
    }

    // Group messages by conversation ID for O(1) lookup
    const messagesByConversation = new Map<string, any[]>();
    allMessages.forEach(msg => {
      const convId = msg.conversationId.toString();
      if (!messagesByConversation.has(convId)) {
        messagesByConversation.set(convId, []);
      }
      messagesByConversation.get(convId)!.push(msg);
    });

    // Helper function to get participant from maps
    const getParticipant = (id: string) => {
      return userMap.get(id) || adminMap.get(id) || scholarMap.get(id) || null;
    };

    // Build the response using pre-fetched data (no more individual queries!)
    const ordersWithConversations = conversations.map((conversation) => {
      // Get participants from maps
      const populatedParticipants = (conversation.participants || [])
        .map((id: any) => getParticipant(id.toString()))
        .filter((p: any) => p !== null);

      // Get messages for this conversation and populate senders
      const conversationMessages = messagesByConversation.get(conversation._id.toString()) || [];
      const populatedMessages = conversationMessages.map(message => ({
        ...message,
        sender: message.sender ? getParticipant(message.sender.toString()) : null,
      }));

      const latestMessage = populatedMessages.length > 0 
        ? populatedMessages[populatedMessages.length - 1] 
        : null;

      return {
        order: conversation.orderId,
        conversation: {
          _id: conversation._id,
          participants: populatedParticipants,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
        messages: populatedMessages,
        latestMessage,
        messageCount: populatedMessages.length,
      };
    });

    res.status(200).json({
      message: "Orders with conversations retrieved successfully",
      count: ordersWithConversations.length,
      ordersWithConversations,
    });
  } catch (error) {
    console.error("❌ Error fetching all orders with conversations:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

