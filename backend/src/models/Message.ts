import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    audioUrl: {
      type: String, // for scholar voice notes
    },
    type: {
      type: String,
      enum: ["user", "adminToScholar", "scholar","adminToUser"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);

