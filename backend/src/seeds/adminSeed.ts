import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin";
import { syncAdminToCms } from "../services/cmsSyncService";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ||
  (process.env.MONGODB_URI as string);

// Admin credentials are supplied via environment variables so no personal
// login is baked into the repository.
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@barakah.local";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "changeme123";

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists with this email. Skipping seed.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create admin (password will be automatically encrypted by the model's pre-save hook)
    const admin = await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    console.log("✅ Admin seeded successfully");
    console.log("📧 Email:", admin.email);
    console.log("👤 Name:", admin.name);

    syncAdminToCms({
      id: (admin._id as any).toString(),
      name: admin.name,
      email: admin.email,
      password: ADMIN_PASSWORD,
    });

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

