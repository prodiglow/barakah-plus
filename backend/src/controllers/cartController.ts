import { Request, Response } from "express";
import Cart from "../models/Cart";
import { Order } from "../models/Orders";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import Admin from "../models/Admin";
import User from "../models/User";
import { Scholar } from "../models/Scholar";
import { sendEmail } from "../services/emailService";
import { sendWhatsAppMessage } from '../services/twilioService';

/**
 * 🛒 Add item to cart
 */
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID, scholarID, name, reason,service, selectWazifa, ...rest } = req.body;

    console.log("🛒 [AddToCart] Received payload:", { userID, scholarID, name, reason, service, selectWazifa });

    // Check if an exact combination exists
    const existingCartItem = await Cart.findOne({ userID, scholarID, name, reason,service, selectWazifa });

    if (existingCartItem) {
      console.warn("⚠️ [AddToCart] Duplicate item found:", existingCartItem._id);
       res.status(400).json({
        success: false,
        message: "This cart entry already exists in your cart.",
      });
      return; 
    }

    // Save new entry
    const cartItem = new Cart({ userID, scholarID, name, reason,service, selectWazifa, ...rest });
    await cartItem.save();
    
    console.log("✅ [AddToCart] Item added successfully:", cartItem._id);
    res.status(201).json({ success: true, data: cartItem });
  } catch (error: any) {
    console.error("❌ [AddToCart] Error adding to cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * 📦 Get all items for a user
 */
export const getUserCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;
    const cartItems = await Cart.find({ userID, status: "in_cart" }).populate("scholarID");
    res.status(200).json({ success: true, data: cartItems });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ❌ Remove an item from cart
 */
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Cart.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Item removed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🔄 Update cart item (optional)
 */
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await Cart.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🧹 Clear all items for a user
 */
export const clearUserCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.params;
    await Cart.deleteMany({ userID });
    res.status(200).json({ success: true, message: "Cart cleared successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moveCartToOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID } = req.body;

    if (!userID) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    // 🔹 1. Fetch all cart items, Admin, and User (once)
    const [cartItems, admin, user] = await Promise.all([
      Cart.find({ userID, status: "in_cart" }),
      Admin.findOne().lean(),
      User.findById(userID).lean()
    ]);

    if (!cartItems || cartItems.length === 0) {
      res.status(404).json({ success: false, message: "No items in cart" });
      return;
    }

    if (!admin) {
      res.status(500).json({ success: false, message: "Admin not found" });
      return;
    }

    // 🔹 2. Batch fetch all Scholars needed
    const scholarIDs = Array.from(new Set(cartItems.map(item => item.scholarID).filter(id => !!id)));
    const scholars = await Scholar.find({ _id: { $in: scholarIDs } }).lean();
    const scholarMap = new Map(scholars.map(s => [s._id.toString(), s]));

    // 🔹 3. Create orders, conversations, and messages
    const orders = await Promise.all(
      cartItems.map(async (item) => {
        const newOrder = new Order({
          OrderTitle: item.service,
          UserID: item.userID,
          ScholarID: item.scholarID,
          name: item.name,
          motherName: item.motherName,
          gender: item.gender,
          phone: item.contact,
          Sect: item.sect,
          Reason: item.reason,
          PrefferedLanguage: item.language,
          message: item.message,
          AudioURL: item.audioUrl || "",
          OrderAmt: item.fee,
          PaymentStatus: "Paid",
          Status: "Pending Admin Review",
          quranKhawaniDate: item.quranKhawaniDate,
          quranKhawaniTimeSlot: item.quranKhawaniTimeSlot,
          featureOnHomePage: item.featureOnHomePage,
          selectWazifa: item.selectWazifa,
        });

        const savedOrder = await newOrder.save();

        // Database logic for Conversation and Message
        try {
          // Optimization: No need to check findOne for a brand new order, just create
          const conversation = await Conversation.create({
            orderId: savedOrder._id,
            participants: [item.userID, admin._id, item.scholarID].filter(p => !!p),
          });

          await Message.create({
            conversationId: conversation._id,
            sender: item.userID,
            text: item.message || "",
            audioUrl: item.audioUrl || "",
            type: "user",
          });

          // 🔹 4. FIRE-AND-FORGET Notifications (Non-blocking)
          const scholar = item.scholarID ? scholarMap.get(item.scholarID.toString()) : null;
          
          if (user && user.email) {
            const subject = `Request Confirmation - Request #${savedOrder.OrderID}`;
            const isQuranKhawani = savedOrder.OrderTitle === 'Quran Khawani';
            
            // Hide scholar info if it's Quran Khawani 
            // Free orders typically don't go through cart, but we primarily care about hiding scholar info for Quran Khawani here
            const showScholarInfo = !isQuranKhawani;
            
            const scholarText = showScholarInfo ? `Scholar: ${scholar ? (scholar as any).scholarName : "N/A"}\n` : "";
            const scholarHtml = showScholarInfo ? `<p><strong>Scholar:</strong> ${scholar ? (scholar as any).scholarName : "N/A"}</p>` : "";
            
            let nextStepTextPlainText = "";
            let nextStepTextHtml = "";
            if (isQuranKhawani) {
              nextStepTextPlainText = `What happens next? You will receive a live meeting link for your Quran Khwani shortly. Please share it with friends and family to attend the Quran Khwani at your specified time.`;
              nextStepTextHtml = `What happens next? You will receive a live meeting link for your Quran Khwani shortly. Please share it with friends and family to attend the Quran Khwani at your specified time.`;

            } else {
              const innerText = `Your request has been forwarded to ${scholar ? (scholar as any).scholarName : "N/A"}. You will receive a notification via WhatsApp and Email once the scholar has processed your request or completed the service.`;
              nextStepTextPlainText = `What happens next? ${innerText}`;
              nextStepTextHtml = innerText;
            }

            const emailBody = `Dear ${user.name},\n\nThank you for choosing Baraka. We are pleased to confirm that your request has been successfully received.\n\nRequest Details:\nOrder ID: #${savedOrder.OrderID}\nService: ${savedOrder.OrderTitle}\n${scholarText}Amount Paid: ${savedOrder.OrderAmt}\n\n${nextStepTextPlainText}\n\nView your request: https://www.barakaplus.com/user/dashboard/orders?orderId=${savedOrder._id}`;

            const emailHtml = `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Request Confirmation</h2>
                <p>Dear <strong>${user.name}</strong>,</p>
                <p>Thank you for choosing Baraka. We are pleased to confirm that your request has been successfully received.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Request ID:</strong> #${savedOrder.OrderID}</p>
                    <p><strong>Service:</strong> ${savedOrder.OrderTitle}</p>
                    ${scholarHtml}
                    <p><strong>Amount Paid:</strong> ${savedOrder.OrderAmt}</p>
                </div>
                <p><strong>What happens next?</strong> ${nextStepTextHtml}</p>
                <div style="margin: 30px 0; text-align: left;">
                    <a href="https://www.barakaplus.com/user/dashboard/orders?orderId=${savedOrder._id}" style="background-color: #0A9E6F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Request Details</a>
                </div>
                <p>If you have any questions, please contact our support team.</p>
                <p>Thank you, <br/><strong>The Baraka Team</strong></p>
                <a href="https://www.barakaplus.com" style="color: #0A9E6F;">www.barakaplus.com</a>
              </div>`;

            // Background send
            sendEmail(user.email, subject, emailBody, emailHtml).catch(err => 
              console.error(`❌ Background Email Error for order ${savedOrder._id}:`, err)
            );

            // Background WhatsApp
            sendWhatsAppMessage(user.phone || "").catch(err => 
              console.error(`❌ Background WhatsApp Error for order ${savedOrder._id}:`, err)
            );
          }
        } catch (dbErr) {
          console.error(`❌ Internal DB Error for order ${savedOrder._id}:`, dbErr);
        }

        return savedOrder;
      })
    );

    // 🔹 5. Clear the user's cart
    await Cart.deleteMany({ userID });

    res.status(200).json({
      success: true,
      message: "Cart items moved to orders successfully",
      data: orders,
    });
  } catch (error: any) {
    console.error("Error moving cart to orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};