import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

//const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/barakahDB";
const MONGO_URI = process.env.MONGODB_URI || (process.env.MONGODB_URI as string);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default mongoose;
