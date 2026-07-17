import mongoose from "mongoose";
import dotenv from "dotenv";
import UserCards from "../models/UserCards";
import { encrypt } from "../utils/encryption";

dotenv.config();

const seedUserCards = async () => {
  try {
    await mongoose.connect(
      (process.env.MONGODB_URI as string)
    );
    console.log("✅ MongoDB connected");

    await UserCards.deleteMany({});
    console.log("🧹 Cleared old UserCards collection");

    // ✅ Convert to ObjectId
    const userID = new mongoose.Types.ObjectId("68ecb2ba1276ad36c53799e7");

    const cards = [
      {
        userID,
        cardNumber: encrypt("4111111111111111"),
        expiryDate: encrypt("12/27"),
        cvc: encrypt("123"),
        nameOnCard: encrypt("John Doe"),
      },
      {
        userID,
        cardNumber: encrypt("5500000000000004"),
        expiryDate: encrypt("11/26"),
        cvc: encrypt("456"),
        nameOnCard: encrypt("Jane Smith"),
      },
      {
        userID,
        cardNumber: encrypt("4000056655665556"),
        expiryDate: encrypt("09/28"),
        cvc: encrypt("789"),
        nameOnCard: encrypt("Alice Johnson"),
      },
      {
        userID,
        cardNumber: encrypt("6011111111111117"),
        expiryDate: encrypt("08/29"),
        cvc: encrypt("321"),
        nameOnCard: encrypt("Bob Brown"),
      },
    ];

    await UserCards.insertMany(cards);
    console.log("✅ UserCards seeded successfully (encrypted data stored)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding UserCards:", error);
    process.exit(1);
  }
};

seedUserCards();
