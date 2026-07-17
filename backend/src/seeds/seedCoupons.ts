import mongoose from "mongoose";
import dotenv from "dotenv";
import Coupon from "../models/Coupon";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI ||
  (process.env.MONGODB_URI as string);

const coupons = [
  {
    code: "SAVE10",
    type: "percentage",
    value: 10,
    isActive: true,
    expiryDate: new Date("2025-12-31"),
  },
  {
    code: "SAVE500",
    type: "fixed",
    value: 500,
    isActive: true,
    expiryDate: new Date("2025-12-31"),
  },
  {
    code: "WELCOME15",
    type: "percentage",
    value: 15,
    isActive: true,
    expiryDate: new Date("2025-12-31"),
  },
  {
    code: "DISCOUNT200",
    type: "fixed",
    value: 200,
    isActive: true,
    expiryDate: new Date("2025-12-31"),
  },
  {
    code: "HOLIDAY20",
    type: "percentage",
    value: 20,
    isActive: true,
    expiryDate: new Date("2025-12-31"),
  },
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log("🗑️ Existing coupons cleared");

    // Insert new coupons
    await Coupon.insertMany(coupons);
    console.log("✅ Coupons seeded successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding coupons:", err);
    process.exit(1);
  }
};

seedCoupons();
