import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  userID: mongoose.Types.ObjectId;
  scholarID: mongoose.Types.ObjectId;
  orderID?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: "pending" | "approved";
  location:string;
  createdAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  scholarID: { type: Schema.Types.ObjectId, ref: "Scholar", required: true },
  orderID: { type: Schema.Types.ObjectId, ref: "Order" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved"], default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
