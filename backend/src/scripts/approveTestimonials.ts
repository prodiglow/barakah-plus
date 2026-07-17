import mongoose from "mongoose";
import dotenv from "dotenv";
import { PlatformTestimonial } from "../models/PlatformTestimonial";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || (process.env.MONGODB_URI as string);

async function approveAll() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await PlatformTestimonial.updateMany(
      { status: "pending" },
      { $set: { status: "approved" } }
    );

    console.log(`✅ Approved ${result.modifiedCount} testimonials.`);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

approveAll();
