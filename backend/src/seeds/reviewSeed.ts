import mongoose from "mongoose";
import dotenv from "dotenv";
import { Scholar } from "../models/Scholar";
import { ScholarReview } from "../models/ScholarReview";
import User from "../models/User";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  (process.env.MONGODB_URI as string);

async function reviewseed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const scholar = await Scholar.findOne();
    if (!scholar) throw new Error("No scholar found!");

    const user = await User.findOne();
    if (!user) throw new Error("No user found! Please register one.");

    const review = await ScholarReview.create({
      scholar: scholar._id,
      reviewer: user._id,
      rating: 5,
      comment: "Amazing scholar, very detailed and kind.",
    });

    // ✅ Explicitly cast review._id to ObjectId
    scholar.reviews?.push(review._id as mongoose.Types.ObjectId);
    await scholar.save();

    console.log("✅ Review created:", review);
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

reviewseed();
