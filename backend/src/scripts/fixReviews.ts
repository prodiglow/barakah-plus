import mongoose from "mongoose";
import dotenv from "dotenv";
import { Scholar } from "../models/Scholar";
import { ScholarReview } from "../models/ScholarReview";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || (process.env.MONGODB_URI as string);

async function fixReviews() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const reviews = await ScholarReview.find({});
    console.log(`Found ${reviews.length} reviews.`);

    for (const review of reviews) {
      if (!review.scholar) continue;

      const scholar = await Scholar.findById(review.scholar);
      if (scholar) {
        // Check if review is already linked
        // @ts-ignore
        if (!scholar.reviews.includes(review._id)) {
            // @ts-ignore
          scholar.reviews.push(review._id);
          await scholar.save();
          console.log(`Linked review ${review._id} to scholar ${scholar.scholarName}`);
        }
      }
    }

    console.log("🎉 All reviews processed and linked.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing reviews:", error);
    process.exit(1);
  }
}

fixReviews();
