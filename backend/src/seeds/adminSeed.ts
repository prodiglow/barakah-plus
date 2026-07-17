import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ||
  (process.env.MONGODB_URI as string);

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "zarghammujtaba991@gmail.com" });
    
    if (existingAdmin) {
      console.log("⚠️ Admin already exists with this email. Skipping seed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin (password will be automatically encrypted by the model's pre-save hook)
    const admin = await Admin.create({
      name: "Admin",
      email: "zarghammujtaba991@gmail.com",
      password: "zargham123",
    });

    console.log("✅ Admin seeded successfully");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);

    await mongoose.disconnect();
    console.log("✅ Done and disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();

