import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  OrderTitle: string;
  OrderID: number;
  Status: "Confirmed" | "Pending Admin Review" | "Unsafe Requires Edit" | "Completed";
  UserID: mongoose.Schema.Types.ObjectId;
  ScholarID: mongoose.Schema.Types.ObjectId; // ✅ reference to Scholar
  OrderAmt: number;
  PaymentStatus: "Unpaid" | "Paid" | "Refunded" | "Pending";

  // Additional Fields
  name: string;
  motherName?: string;
  gender: string;
  phone: string;
  Sect: string;
  Reason: string;
  PrefferedLanguage?: string;
  message?: string;
  AudioURL?: string;
  // Quran Khawani specific fields
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  featureOnHomePage?: boolean;
  // Wazaif & Azkar specific field
  selectWazifa?: string;
  
  // Feedback Fields
  feedbackGiven?: boolean;
  feedbackPopupCount?: number;
  plateformFeedbackPopupCount?: number;

  // Notification Fields
  isReadByUser?: boolean;
  isReadByAdmin?: boolean;

  // 💰 Scholar Payment Status
  ScholarHadiyapaid: boolean;
  isEventCreated: boolean;
}

// Counter model (shared by all collections)
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 11 }, // start from 11
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);

// Main Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    OrderTitle: { type: String, required: true, trim: true },
    OrderID: { type: Number, unique: true },
    Status: {
      type: String,
      // enum: ["Confirmed", "Pending Admin Review", "Unsafe Requires Edit", "Completed"],
      enum: [
        "Pending Admin Review",
        "Awaiting User Revision",
        "Sent To Scholar",
        "In Progress By Scholar",
        "Revision Requested By Admin",
        "Approved By Admin",
        "Delivered To User",
        "Completed",
        "Cancelled",
        "Confirmed",
        "Scholar Submitted – Pending Review",
        "User Review Requested"
      ],
      default: "Pending Admin Review",
    },
    UserID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ScholarID: { type: Schema.Types.ObjectId, ref: "Scholar" }, // reference to Scholar
    OrderAmt: { type: Number, required: true, min: 0 },
    PaymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded", "Pending"],
      default: "Pending",
    },
    
    // 🌟 Feedback Fields
    feedbackGiven: { type: Boolean, default: false },
    feedbackPopupCount: { type: Number, default: 0 },
    plateformFeedbackPopupCount: { type: Number, default: 0 },
    
    // 🔔 Notification Fields
    isReadByUser: { type: Boolean, default: true }, // Default true (user created it)
    isReadByAdmin: { type: Boolean, default: false }, // Default false (Admin hasn't seen it)

    // 💰 Scholar Payment Status
    ScholarHadiyapaid: { type: Boolean, default: false },
    isEventCreated: { type: Boolean, default: false },

    // 🧾 Additional Fields
    name: { type: String, required: true, trim: true },
    motherName: { type: String, trim: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    Sect: { type: String, required: true },
    Reason: { type: String }, // Not required for Quran O Hadith service
    PrefferedLanguage: { type: String },
    message: { type: String },
    AudioURL: { type: String },
    // Quran Khawani specific fields
    quranKhawaniDate: { type: String },
    quranKhawaniTimeSlot: { type: String },
    featureOnHomePage: { type: Boolean, default: false },
    // Wazaif & Azkar specific field
    selectWazifa: { type: String },
  },
  { timestamps: true }
);

// 🪄 Auto-increment OrderID before saving
OrderSchema.pre<IOrder>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "OrderID" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.OrderID = counter.seq;
  }
  next();
});

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
