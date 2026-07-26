import { Request, Response } from "express";
import { Order } from "../models/Orders";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import Admin from "../models/Admin";
import User from "../models/User";
import { Scholar } from "../models/Scholar";
import { sendEmail } from "../services/emailService";
import { sendWhatsAppMessage } from '../services/twilioService';
import { assignScholarForFreeService } from "../services/scholarAssignmentService";

// 📌 Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      OrderTitle,
      Status,
      UserID,
      ScholarID,        // ✅ new field
      OrderAmt,
      PaymentStatus,
      name,
      motherName,
      gender,
      phone,
      Sect,
      Reason,
      PrefferedLanguage,
      message,
      AudioURL,  
      couponCode,
      couponDiscount,       // ✅ new field
      // Quran Khawani specific fields
      quranKhawaniDate,
      quranKhawaniTimeSlot,
      featureOnHomePage,
      // Wazaif & Azkar specific field
      selectWazifa,
    } = req.body;

    // Check for missing required fields
    const missingFields: string[] = [];
    if (!OrderTitle) missingFields.push("OrderTitle");
    if (!UserID) missingFields.push("UserID");
    // ScholarID is optional now (for Free Personal Dua)
    if (OrderAmt<0 || isNaN(OrderAmt)) missingFields.push("OrderAmt");
    if (!name) missingFields.push("name");
    if (!gender) missingFields.push("gender");
    if (!phone) missingFields.push("phone");
    if (!Sect) missingFields.push("Sect");
    // Reason is optional for Quran O Hadith service
    if (!Reason && OrderTitle !== "Quran O Hadith") missingFields.push("Reason");

    if (missingFields.length > 0) {
      console.log("❌ Missing required fields:", missingFields.join(", "));
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields: missingFields
      });
    }

    // 🧠 Auto-assign scholar for Free Personal Dua (OrderAmt === 0) OR Quran Khawani
    // Number(...) guards against OrderAmt arriving as the string "0" — a strict
    // `OrderAmt === 0` check silently skips assignment in that case, while the
    // stored order still *displays* OrderAmt: 0 after Mongoose casts it on save,
    // which makes the bug invisible from the database alone.
    let assignedScholarId = ScholarID;
    if (Number(OrderAmt) === 0 || OrderTitle === "Quran Khawani") {
      const { scholarId, matchQuality } = await assignScholarForFreeService(
        gender,
        Sect,
        OrderTitle
      );
      assignedScholarId = scholarId;

      if (matchQuality === "any" || matchQuality === "any_scholar") {
        console.warn(
          `⚠️ Scholar auto-assignment fell back to "${matchQuality}" match for gender=${gender}, Sect=${Sect}, OrderTitle=${OrderTitle}. Assigned scholarId=${assignedScholarId}. Admin follow-up recommended.`
        );
      }
    }

    const newOrder = await Order.create({
      OrderTitle,
      Status,
      UserID,
      ScholarID: assignedScholarId,       // included in creation
      OrderAmt,
      PaymentStatus,
      name,
      motherName,
      gender,
      phone,
      Sect,
      Reason,
      PrefferedLanguage,
      message,
      AudioURL,   
      couponCode,
      couponDiscount,       // included in creation
      // Quran Khawani specific fields
      quranKhawaniDate,
      quranKhawaniTimeSlot,
      featureOnHomePage,
      selectWazifa,
    });

    // Insert conversation into Conversation collection for this order
    try {
      // Get the admin (assuming there's only one admin)
      const admin = await Admin.findOne();
      
      if (!admin) {
        console.warn("⚠️ No admin found. Conversation insertion skipped.");
      } else {
        // Check if conversation already exists for this order
        let conversation = await Conversation.findOne({ orderId: newOrder._id });
        
        if (!conversation) {
          // Insert new conversation into Conversation collection
          conversation = await Conversation.create({
            orderId: newOrder._id,
            participants: [UserID, admin._id, assignedScholarId],
          });
          console.log("✅ Conversation inserted into Conversation collection for order:", newOrder._id);
        } else {
          console.log("ℹ️ Conversation already exists for order:", newOrder._id);
        }

        // Insert initial message into Message collection if message or AudioURL exists
        if (message || AudioURL) {
          try {
            await Message.create({
              conversationId: conversation._id,
              sender: UserID,
              text: message || "",
              audioUrl: AudioURL || "",
              type: "user",
            });
            console.log("✅ Message inserted into Message collection for conversation:", conversation._id);
          } catch (messageError) {
            console.error("❌ Error inserting message into Message collection:", messageError);
            // Don't fail the order creation if message creation fails
          }
        }
      }
    } catch (conversationError) {
      console.error("❌ Error inserting conversation into Conversation collection:", conversationError);
      // Don't fail the order creation if conversation creation fails
    }

    // Send confirmation email to user
    try {
      const user = await User.findById(UserID);
      const scholar = await Scholar.findById(assignedScholarId);

      if (user && user.email) {
        const subject = `Request Confirmation - Request #${newOrder.OrderID}`;

        // Check if this is a Quran Khawani order
        const isQuranKhawani = newOrder.OrderTitle === 'Quran Khawani';

        // Hide scholar info if free order or if it's Quran Khawani
        const showScholarInfo = OrderAmt !== 0 && !isQuranKhawani;
        
        const scholarText = showScholarInfo ? `Scholar: ${scholar ? scholar.scholarName : "N/A"}\n\n` : "";
        const scholarHtml = showScholarInfo ? `<p><strong>Scholar:</strong> ${scholar ? scholar.scholarName : "N/A"}</p>` : "";
        
        let nextStepTextPlainText = "";
        let nextStepTextHtml = "";
        if (isQuranKhawani) {
          nextStepTextPlainText = `What happens next? You will receive a live meeting link for your Quran Khwani shortly. Please share it with friends and family to attend the Quran Khwani at your specified time.`;
          nextStepTextHtml = `What happens next? You will receive a live meeting link for your Quran Khwani shortly. Please share it with friends and family to attend the Quran Khwani at your specified time.`;

        } else {
          const innerText = showScholarInfo 
            ? `Your request has been forwarded to ${scholar ? scholar.scholarName : "N/A"}. You will receive a notification via WhatsApp and Email once the scholar has processed your request or completed the service.`
            : `Your request has been received. You will receive a notification via WhatsApp and Email once your request has been processed.`;
          nextStepTextPlainText = `What happens next? ${innerText}`;
          nextStepTextHtml = innerText;
        }

        const body = `Dear ${user.name},

Thank you for choosing Baraka. We are pleased to confirm that your request has been successfully received.

Request Details:

Order ID: #${newOrder.OrderID}

Service: ${newOrder.OrderTitle}

${scholarText}Amount Paid: ${newOrder.OrderAmt}

${nextStepTextPlainText}

If you have any questions, please contact our support team.

Best Regards,
The Baraka Team
https://www.barakaplus.com
View your request: https://www.barakaplus.com/user/dashboard/orders?orderId=${newOrder._id}`;

        const html = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Request Confirmation</h2>
            <p>Dear <strong>${user.name}</strong>,</p>
            <p>Thank you for choosing Baraka. We are pleased to confirm that your request has been successfully received.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Request ID:</strong> #${newOrder.OrderID}</p>
                <p><strong>Service:</strong> ${newOrder.OrderTitle}</p>
                ${scholarHtml}
                <p><strong>Amount Paid:</strong> ${newOrder.OrderAmt}</p>
            </div>
            <p><strong>What happens next?</strong> ${nextStepTextHtml}</p>
            <p>If you have any questions, please contact our support team.</p>
            <div style="margin: 30px 0; text-align: left;">
                <a href="https://www.barakaplus.com/user/dashboard/orders?orderId=${newOrder._id}" style="background-color: #0A9E6F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Request Details</a>
            </div>
            <br/>
            <p><strong>The Baraka Team</strong></p>
            <a href="https://www.barakaplus.com" style="color: #0A9E6F;">www.barakaplus.com</a>
          </div>
        `;

        // Fire-and-forget notifications (Non-blocking)
        sendEmail(user.email, subject, body, html).catch(err => 
          console.error(`❌ Background Email Error for order ${newOrder._id}:`, err)
        );

        sendWhatsAppMessage(user.phone || "").catch(err => 
          console.error(`❌ Background WhatsApp Error for order ${newOrder._id}:`, err)
        );
      }
    } catch (emailError) {
      console.error("❌ Error sending confirmation email:", emailError);
    }

    res.status(201).json({
      message: "✅ Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
      .populate("UserID", "name email")
      .populate("ScholarID", "scholarName scholarSpecialization fee");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("UserID", "name email")
      .populate("ScholarID", "scholarName scholarSpecialization fee");
    if (!order) return res.status(404).json({ message: "Request not found" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Update an order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    // Check if status is changing to Completed
    const updateData = { ...req.body };
    if (updateData.Status === "Completed" || updateData.Status === "User Review Requested") {
      updateData.isReadByUser = false; 
    }
    
    // Notify Admin when Scholar submits
    if (updateData.Status === "Scholar Submitted – Pending Review") {
      updateData.isReadByAdmin = false;
    }

    // 🌟 If status is Completed, check if OrderAmt is 0
    if (updateData.Status === "Completed") {
      const order = await Order.findById(req.params.id);
      if (order && order.OrderAmt === 0) {
        updateData.feedbackPopupCount = 3;
        console.log(`ℹ️ Order ${req.params.id} has 0 amount. Setting feedbackPopupCount to 3.`);
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({
      message: "✅ Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "🗑️ Request deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get orders by user ID
export const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ UserID: userId })
      .populate("UserID", "name email")
      .populate("ScholarID", "scholarName scholarSpecialization fee")
      .sort({ OrderID: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No requests found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get orders by scholar ID (Public - for scholar report page)
export const getOrdersByScholarId = async (req: Request, res: Response) => {
  try {
    const { scholarId } = req.params;

    const orders = await Order.find({ ScholarID: scholarId })
      .populate("UserID", "name")
      .populate({
        path: "ScholarID",
        select: "scholarName scholarSpecialization scholarServices fee ProfileImg phone_number",
        populate: [
          { path: "scholarSpecialization", select: "name" },
          { path: "scholarServices", select: "name" }
        ]
      })
      .sort({ OrderID: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching scholar orders:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Check if user has any order with OrderAmt = 0
export const checkZeroAmountOrder = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const zeroAmountOrder = await Order.findOne({ 
      UserID: userId, 
      OrderAmt: 0 
    });

    const result = zeroAmountOrder ? 1 : 0;
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error checking zero amount order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Submit Order Feedback
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating && !comment) {
      return res.status(400).json({ message: "At least a rating or comment is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify order is completed
    if (order.Status !== "Completed") {
      return res.status(400).json({ message: "Feedback can only be given for completed orders" });
    }

    // Check if feedback already given
    // @ts-ignore
    if (order.feedbackGiven) {
      return res.status(400).json({ message: "Feedback already submitted for this request" });
    }

    // Create Scholar Review
    // We need to fetch the scholar ID from the order
    const reviewScholarId = order.ScholarID;

    if (!reviewScholarId) {
       return res.status(400).json({ message: "Scholar ID not found for this order" });
    }
    
    // Dynamically import ScholarReview to avoid circular dependency issues if any
    const { ScholarReview } = require("../models/ScholarReview");

    const reviewData: any = {
      scholar: reviewScholarId,
      reviewer: order.UserID,
      date: new Date(),
    };
    if (rating && Number(rating) > 0) reviewData.rating = Number(rating);
    if (comment && comment.trim()) reviewData.comment = comment.trim();

    const newReview = new ScholarReview(reviewData);

    await newReview.save();
    
    // Add review to Scholar's reviews array
    await Scholar.findByIdAndUpdate(reviewScholarId, {
      $push: { reviews: newReview._id }
    });

    // Mark order as feedback given
    // @ts-ignore
    order.feedbackGiven = true;
    await order.save();

    res.status(200).json({ message: "Feedback submitted successfully", review: newReview });
  } catch (error) {
    console.error("❌ Error submitting feedback:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Increment Feedback Popup Count
export const incrementPopupCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      { $inc: { feedbackPopupCount: 1 } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ 
      // @ts-ignore
      message: "Popup count incremented", 
      // @ts-ignore
      feedbackPopupCount: order.feedbackPopupCount 
    });
  } catch (error) {
    console.error("❌ Error incrementing popup count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Max Out Feedback Popup Count (Set to 3)
export const maxPopupCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🚀 maxPopupCount called for order: ${id}`);

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { feedbackPopupCount: 3 } },
      { new: true }
    );

    if (!order) {
      console.log("❌ Order not found for maxPopupCount");
      return res.status(404).json({ message: "Request not found" });
    }

    console.log(`✅ Order ${id} feedbackPopupCount set to 3. New value: ${order.feedbackPopupCount}`);

    res.status(200).json({ 
      // @ts-ignore
      message: "Popup count maxed out", 
      // @ts-ignore
      feedbackPopupCount: order.feedbackPopupCount 
    });
  } catch (error) {
    console.error("❌ Error maxing popup count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
// 📌 Check count of orders pending admin review (for Admin Badge)
export const checkPendingAdminReviewCount = async (req: Request, res: Response) => {
  try {
    const count = await Order.countDocuments({ Status: "Pending Admin Review" });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Error checking pending admin review count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Check count of orders in progress by scholar (for Admin Badge)
export const checkInProgressByScholarCount = async (req: Request, res: Response) => {
  try {
    const count = await Order.countDocuments({ Status: "In Progress By Scholar" });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Error checking in-progress by scholar count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


// 📌 Check count of orders submitted by scholar pending review (for Admin Badge)
export const checkScholarSubmittedCount = async (req: Request, res: Response) => {
  try {
    const count = await Order.countDocuments({ Status: "Scholar Submitted – Pending Review" });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Error checking scholar submitted count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Get unread completed orders count for a user
export const getUnreadCompletedCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const count = await Order.countDocuments({ 
      UserID: userId, 
      Status: { $in: ["Completed", "User Review Requested"] }, 
      isReadByUser: false 
    });
    res.status(200).json({ count });
  } catch (error) {
    console.error("❌ Error checking unread completed count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Mark all completed orders as read for a user
export const markAllCompletedRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await Order.updateMany(
      { UserID: userId, Status: "Completed", isReadByUser: false },
      { $set: { isReadByUser: true } }
    );
    res.status(200).json({ message: "All completed orders marked as read" });
  } catch (error) {
    console.error("❌ Error marking orders as read:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Mark single order as read (for User Dashboard)
export const markOrderRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Verify user owns the order (handled by logic or trust ID for now, but better to check)
    // For now, simple update
    const order = await Order.findByIdAndUpdate(
      id,
      { isReadByUser: true },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "Request marked as read", data: order });
  } catch (error) {
    console.error("❌ Error marking order as read:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// 📌 Increment Platform Feedback Popup Count
export const incrementPlatformPopupCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      { $inc: { plateformFeedbackPopupCount: 1 } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ 
      // @ts-ignore
      message: "Platform popup count incremented", 
      // @ts-ignore
      plateformFeedbackPopupCount: order.plateformFeedbackPopupCount 
    });
  } catch (error) {
    console.error("❌ Error incrementing platform popup count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
