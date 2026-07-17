import mongoose from "mongoose";
import { Order } from "../models/Orders";
import User from "../models/User";
import {Scholar} from "../models/Scholar"; // Make sure this path is correct

const MONGO_URI =
  (process.env.MONGODB_URI as string);

// Fixed titles
const orderTitles = ["Personal Dua", "Quran Khawani", "Wazaif and Adhkar", "Istikhara"];
const sects = ["Sunni", "Shia", "Barelvi", "Deobandi"];
const reasons = ["Health", "Job", "Marriage", "Peace", "Success"];
const languages = ["Urdu", "English", "Arabic"];
const genders = ["Male", "Female"];

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const Counter = mongoose.connection.collection("counters");

    // 🧹 Clear existing orders
    await Order.deleteMany({});
    console.log("🧹 Cleared old orders");

    // 🔍 Fetch users
    const users = await User.find({});
    if (users.length === 0) {
      console.log("⚠️ No users found. Please seed users first!");
      process.exit(1);
    }

    // 🔍 Fetch scholars
    const scholars = await Scholar.find({});
    if (scholars.length === 0) {
      console.log("⚠️ No scholars found. Please seed scholars first!");
      process.exit(1);
    }

    // 🌱 Create 10 random orders linked to real users and scholars
    const orders = Array.from({ length: 10 }, (_, i) => {
      const randomTitle = orderTitles[i % orderTitles.length];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomScholar = scholars[Math.floor(Math.random() * scholars.length)];
      const randomAmt = parseFloat((Math.random() * 500 + 20).toFixed(2));
      const statuses = ["Confirmed", "Pending Admin Review", "Unsafe Requires Edit", "Completed"];
      const paymentStatuses = ["Unpaid", "Paid", "Refunded", "Pending"];
      const orderID = i;
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const sect = sects[Math.floor(Math.random() * sects.length)];
      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      const language = Math.random() > 0.3 ? languages[Math.floor(Math.random() * languages.length)] : undefined;

      return {
        OrderTitle: randomTitle,
        AudioURL: "url",
        Status: statuses[Math.floor(Math.random() * statuses.length)],
        UserID: randomUser._id,
        ScholarID: randomScholar._id, // ✅ Added Scholar reference
        OrderID: orderID,
        OrderAmt: randomAmt,
        PaymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        name: gender === "Male" ? "Ahmad Khan" : "Ayesha Bibi",
        motherName: gender === "Male" ? "Fatima" : "Khadija",
        gender,
        phone: `0300${Math.floor(1000000 + Math.random() * 8999999)}`,
        Sect: sect,
        Reason: reason,
        PrefferedLanguage: language,
        message:
          Math.random() > 0.5
            ? "Please include me in your special prayers."
            : "Need urgent assistance with this request.",
      };
    });

    await Order.insertMany(orders);
    console.log("🌱 Seeded 10 orders successfully!");

    // Reset counter to start from 11 again
    await Counter.updateOne(
      { _id: "OrderID" as any },
      { $set: { seq: 11 } },
      { upsert: true }
    );
    console.log("🔢 Counter reset successfully (next OrderID will start from 11)");

    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
    await mongoose.connection.close();
  }
}

seedOrders();
