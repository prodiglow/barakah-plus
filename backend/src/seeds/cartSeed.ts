import mongoose from "mongoose";
import dotenv from "dotenv";
import Cart from "../models/Cart";

dotenv.config();

const seedCart = async () => {
  try {
    await mongoose.connect( process.env.MONGO_URI ||
  (process.env.MONGODB_URI as string));
    console.log("✅ MongoDB Connected");

    await Cart.deleteMany();

    const sampleData = [
      {
        userID: "68ecb2ba1276ad36c53799e7",
        name: "Ali",
        motherName: "Aliya",
        gender: "male",
        contact: "03041078740",
        sect: "sect1",
        reason: "Education",
        language: "Urdu",
        message: "ASAP",
        scholarID: "68f096b14829b2ccef2c6e3e",
        service: "Personal Dua",
        fee: 30,
        audioUrl:"url",
      },
      {
        userID: "68ecb2ba1276ad36c53799e7",
        name: "Ahmed",
        motherName: "Sara",
        gender: "male",
        contact: "03121234567",
        sect: "sect2",
        reason: "Health Issue",
        language: "English",
        message: "Please pray for recovery",
        scholarID: "68f0963d4829b2ccef2c6e3a",
        service: "Wazaif and Adhkar",
        fee: 20,
        audioUrl:"url",
      },
    ];

    await Cart.insertMany(sampleData);
    console.log("✅ Cart seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedCart();
