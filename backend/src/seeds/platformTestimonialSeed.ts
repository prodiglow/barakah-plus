import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import { PlatformTestimonial } from "../models/PlatformTestimonial";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || (process.env.MONGODB_URI as string);

const testimonials = [
  {
    comment: "I booked a Quran Khwani for my late father during Muharram. The recitation video brought tears to my eyes. May Allah bless your team for providing such a beautiful service.",
    rating: 5,
  },
  {
    comment: "The interface is very easy to use, and I could book a scholar for Istikhara within minutes. Highly recommended!",
    rating: 5,
  },
  {
    comment: "Barakah has made it so easy to give Sadqah. I love the transparency and the video proof provided.",
    rating: 5,
  },
  {
    comment: "Excellent customer service. They guided me through the entire process of booking a Nikah Khawan.",
    rating: 4,
  },
  {
    comment: "I was looking for a reliable way to perform Dam for my sick child. The scholar was very kind and professional.",
    rating: 5,
  },
  {
    comment: "Great initiative. It's hard to find authentic scholars online, but this platform solves that problem perfectly.",
    rating: 5,
  },
  {
    comment: "The Personal Dua service gave me so much peace of mind. Thank you Barakah team.",
    rating: 5,
  }
];

async function seedTestimonials() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing testimonials if desired? User didn't ask to clear. I'll just append.
    // Actually, to make it clean for testing, I won't clear, just add.

    const user = await User.findOne();
    if (!user) throw new Error("No user found! Please register one.");

    console.log(`Using user: ${user.name} (${user._id})`);

    const seedData = testimonials.map(t => ({
      ...t,
      user: user._id,
      status: "pending",
    }));

    await PlatformTestimonial.insertMany(seedData);
    console.log(`✅ Successfully seeded ${seedData.length} pending testimonials.`);

  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedTestimonials();
