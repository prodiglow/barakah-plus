import mongoose from "mongoose";
import dotenv from "dotenv";
import { PlatformTestimonial } from "../models/PlatformTestimonial";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || (process.env.MONGODB_URI as string);

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const total = await PlatformTestimonial.countDocuments();
    const pending = await PlatformTestimonial.countDocuments({ status: "pending" });
    const approved = await PlatformTestimonial.countDocuments({ status: "approved" });

    console.log(`Total: ${total}, Pending: ${pending}, Approved: ${approved}`);
    
    // Force approve again if pending > 0
    if (pending > 0) {
        const res = await PlatformTestimonial.updateMany({ status: "pending" }, { $set: { status: "approved" } });
        console.log(`Force approved: ${res.modifiedCount}`);
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();
