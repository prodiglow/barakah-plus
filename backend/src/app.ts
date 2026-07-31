import express from "express";
import cors from "cors";
import { corsOptions } from "./config/cors";
import scholarRoutes from "./routes/scholarRoutes";
import authRoutes from "./routes/authRoutes";
import uploadRouter from "./routes/upload";
import userRoutes from "./routes/userRoutes";
import eventR from "./routes/eventRoutes";
import orderRoutes from "./routes/orderRoutes";
import cartRoutes from "./routes/cartRoutes";
import testimonialRoutes from "./routes/testimonialRoutes";
import userCardsRoutes from "./routes/userCardsRoutes";
import adminRoutes from "./routes/adminRoutes";
import messageRoutes from "./routes/messageRoutes";
import userChatRoutes from "./routes/userChatRoutes";
import scholarChatRoutes from "./routes/scholarChatRoutes";
import reminderRoutes from "./routes/reminderRoutes";
import emailRoutes from "./routes/emailRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import testTwilioRoutes from "./routes/testTwilioRoutes";
import duaRoutes from "./routes/duaRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import jazzcashRoutes from "./routes/jazzcashRoutes";
import alfalahRoutes from "./routes/alfalahRoutes";
import islamicProductRoutes from "./routes/islamicProductRoutes";
import paymentTransactionRoutes from "./routes/paymentTransactionRoutes";
import blogRoutes from "./routes/blogRoutes";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For JazzCash callbacks

// Routes
app.use("/api/scholars", scholarRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", uploadRouter);
app.use("/api/user", userRoutes);
app.use("/api/events", eventR);
app.use("/api/orders", orderRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/testimonial",testimonialRoutes)
app.use("/api/cards",userCardsRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/user-chat", userChatRoutes)
app.use("/api/scholar-chat", scholarChatRoutes)
app.use("/api/reminders", reminderRoutes)
app.use("/api/email", emailRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/test-twilio", testTwilioRoutes);
app.use("/api/duas", duaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", jazzcashRoutes);
app.use("/api/alfalah", alfalahRoutes);
app.use("/api/islamic-products", islamicProductRoutes);
app.use("/api/payment-transactions", paymentTransactionRoutes);
app.use("/api/blogs", blogRoutes);




app.get("/", (req, res) => {
  res.send("🚀 Backend running with MongoDB + TypeScript + Auth!");
});

export default app;
