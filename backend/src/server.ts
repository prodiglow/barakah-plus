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

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  });
