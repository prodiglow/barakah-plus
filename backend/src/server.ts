import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import "./models/Scholar";
import "./models/ScholarEducation";
import "./models/ScholarSpecialization";
import "./models/ScholarReview";
import "./models/scholarServices";
import "./models/User";
import islamicProductRoutes from './routes/islamicProductRoutes';

app.use('/api/islamic-products', islamicProductRoutes);

// Establish the DB connection at cold start. On serverless we must NOT
// process.exit on failure (that would crash the function) — Mongoose buffers
// queries until the connection is ready.
connectDB().catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
});

// Only bind a port outside serverless (local dev, traditional hosts).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app so Vercel's @vercel/node can use it as the handler.
export default app;
