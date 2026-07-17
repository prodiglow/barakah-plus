import mongoose from "mongoose";
import dotenv from "dotenv";
import { Event } from "../models/Event";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || (process.env.MONGODB_URI as string);

const migrateEvents = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for migration...");

    const events = await Event.find({});
    console.log(`Found ${events.length} events to check/migrate.`);

    for (const event of events) {
      const eventObj = event.toObject() as any;
      let updated = false;

      // Migrate eventFor -> description (if needed)
      if (eventObj["eventFor"] && !event.description) {
        event.description = eventObj["eventFor"];
        // cast to any to unset the old field if strict typing blocks it
        (event as any).set("eventFor", undefined, { strict: false });
        updated = true;
        console.log(`Migrated eventFor -> description for: ${event.eventTitle}`);
      }

      // Ensure isFeatured is present
      if (event.isFeatured === undefined) {
         event.isFeatured = false;
         updated = true;
         console.log(`Initialized isFeatured for: ${event.eventTitle}`);
      }

      if (updated) {
        await event.save();
      }
    }

    // Drop the old field from schema validation if strict, but mainly just unsetting is enough for mongoose
    console.log("Migration completed.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateEvents();
