import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./Category";

export interface IDua extends Document {
  title: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  virtue?: string;
  explanation?: string;
  audioUrl?: string; // stored in Cloudinary
  category: ICategory["_id"][];
  language: string;
  repeat: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DuaSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    arabic_text: { type: String, required: true },
    transliteration: { type: String },
    translation: { type: String, required: true },
    reference: { type: String },
    virtue: { type: String },
    explanation: { type: String },
    audioUrl: { type: String },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    language: { type: String, default: "Arabic / English" },
    repeat: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDua>("Dua", DuaSchema);
