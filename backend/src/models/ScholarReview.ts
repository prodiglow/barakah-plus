import mongoose, { Schema, Document } from "mongoose";

export interface IScholarReview extends Document {
  scholar: mongoose.Types.ObjectId;   // Ref to Scholar
  reviewer: mongoose.Types.ObjectId;  // Ref to User
  rating: number;
  comment: string;
  date: Date;
  status: "pending" | "approved" | "rejected";
}

const ScholarReviewSchema = new Schema<IScholarReview>(
  {
    scholar: { type: Schema.Types.ObjectId, ref: "Scholar", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 👈 connected to your User model
    rating: { type: Number, required: false, min: 1, max: 5 },
    comment: { type: String, required: false, default: "" },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const ScholarReview = mongoose.model<IScholarReview>(
  "ScholarReview",
  ScholarReviewSchema
);
