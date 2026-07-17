import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  title: string;
  image?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    image: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", CategorySchema);
