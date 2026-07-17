import mongoose, { Schema, Document } from "mongoose";
import { Counter } from "./Counter";

export interface IBlog extends Document {
  blogID: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  images: string[];
  tags: string[];
  author: string;
  isFeatured: boolean;
  isPublished: boolean;
  status: "draft" | "published";
}

const BlogSchema = new Schema<IBlog>(
  {
    blogID: { type: Number, unique: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    images: [{ type: String }],
    tags: [{ type: String }],
    author: { type: String, default: "Admin" },
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Auto-increment blogID using shared Counter model
BlogSchema.pre<IBlog>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "blogID" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.blogID = counter.seq;
  }
  next();
});

export const Blog = mongoose.model<IBlog>("Blog", BlogSchema);
