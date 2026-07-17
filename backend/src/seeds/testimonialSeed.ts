import mongoose from "mongoose";
import dotenv from "dotenv";
import Testimonial from "../models/Testimonial";
import {Scholar} from "../models/Scholar"; 

dotenv.config();

const seedTestimonials = async () => {
  try {
    await mongoose.connect((process.env.MONGODB_URI as string));
    console.log("✅ Connected to MongoDB");

    // Fetch scholars from the DB
    const scholars = await Scholar.find().limit(8); // get first 8 scholars
    if (scholars.length === 0) {
      console.log("⚠️ No scholars found. Please seed scholars first.");
      process.exit(1);
    }

    // Clear old testimonials
    await Testimonial.deleteMany({});
    console.log("🧹 Cleared old testimonials");

    const userID = "68ecb2ba1276ad36c53799e7";

    // Predefined messages
    const comments = [
      "I booked a Quran Khwani for my late father during Muharram. The recitation video brought tears to my eyes. May Allah bless your team for providing such a beautiful service.",
      "JazakAllah Khair for offering such a meaningful service. I booked on behalf of my entire family and the peace it brought us was priceless.",
      "I booked a Quran Khwani for my late father during Muharram. The recitation video brought tears to my eyes. May Allah bless your team for providing such a beautiful service.",
      "JazakAllah Khair for offering such a meaningful service. I booked on behalf of my entire family and the peace it brought us was priceless.",
      "I booked a Quran Khwani for my late father during Muharram. The recitation video brought tears to my eyes. May Allah bless your team for providing such a beautiful service.",
      "JazakAllah Khair for offering such a meaningful service. I booked on behalf of my entire family and the peace it brought us was priceless.",
      "I booked a Quran Khwani for my late father during Muharram. The recitation video brought tears to my eyes. May Allah bless your team for providing such a beautiful service.",
      "JazakAllah Khair for offering such a meaningful service. I booked on behalf of my entire family and the peace it brought us was priceless.",
    ];
    const location =[
        "Lahore",
        "USA",
        "Karachi",
        "Multan",
        "Lahore",
        "USA",
        "Karachi",
        "Multan",
    ]

    // Create testimonial data
    const testimonials = scholars.map((scholar, index) => ({
      userID,
      scholarID: scholar._id,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: comments[index],
      status: "approved",
      location:location[index],
    }));

    // Insert testimonials
    await Testimonial.insertMany(testimonials);

    console.log(`✅ Seeded ${testimonials.length} testimonials successfully!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding testimonials:", error);
    process.exit(1);
  }
};

seedTestimonials();
