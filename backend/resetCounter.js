// resetCounter.js
import mongoose from "mongoose";

const MONGO_URI =  process.env.MONGODB_URI;

async function resetCounter() {
  await mongoose.connect(MONGO_URI);

  const Counter = mongoose.connection.collection("counters");
  await Counter.updateOne(
    { _id: "eventID" },
    { $set: { seq: 11 } },
    { upsert: true }
  );

  console.log("✅ Counter reset successfully to 10 (next will be 11)");
  mongoose.connection.close();
}

resetCounter().catch(console.error);
