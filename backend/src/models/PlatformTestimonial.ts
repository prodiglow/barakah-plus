import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformTestimonial extends Document {
  user: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const PlatformTestimonialSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: false, min: 1, max: 5 },
  comment: { type: String, required: false, default: "" },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const PlatformTestimonial = mongoose.model<IPlatformTestimonial>('PlatformTestimonial', PlatformTestimonialSchema);
