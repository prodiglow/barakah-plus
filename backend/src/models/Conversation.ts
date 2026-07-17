import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Made optional to support cart conversations
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: false, // For conversations created from cart
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // can be user, admin, scholar
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);

