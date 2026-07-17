import mongoose, { Schema, Document } from "mongoose";

export interface ICart extends Document {
  userID: string;
  scholarID: string;
  name: string;
  motherName: string;
  gender: string;
  contact: string;
  sect: string;
  reason: string;
  language: string;
  message: string;
  audioUrl: string;
  service: string;
  fee: number;
  status?: string;
  // Quran Khawani specific fields
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  featureOnHomePage?: boolean;
  // Wazaif & Azkar specific field
  selectWazifa?: string;
}

const cartSchema = new Schema<ICart>(
  {
    userID: { type: String, required: true },
    scholarID: { type: String, ref: "Scholar",required:true},
    name: { type: String, required: true },
    motherName: { type: String},
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    sect: { type: String,required:true },
    reason: { type: String ,required:true},
    language: { type: String },
    message: { type: String },
    audioUrl: { type: String },
    service: { type: String,required:true },
    fee: { type: Number },
    status: { type: String, default: "in_cart" },
    // Quran Khawani specific fields
    quranKhawaniDate: { type: String },
    quranKhawaniTimeSlot: { type: String },
    featureOnHomePage: { type: Boolean, default: false },
    // Wazaif & Azkar specific field
    selectWazifa: { type: String },

  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
