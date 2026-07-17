import mongoose from "mongoose";
import { Event } from "../src/models/Event";
import { connectDB } from "../src/config/db";

const updateEvents = async () => {
  try {
    await connectDB();
    
    // Update all events where joiningLink is missing
    const result = await Event.updateMany(
      { joiningLink: { $exists: false } },
      { $set: { joiningLink: "https://www.google.com" } }
    );

    console.log(`✅ Updated ${result.modifiedCount} events with default joiningLink.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating events:", error);
    process.exit(1);
  }
};

updateEvents();
