import { Request, Response } from "express";
import { PlatformTestimonial } from "../models/PlatformTestimonial";
import { Order } from "../models/Orders";

// Submit a testimonial (only if user has completed order)
// Submit a testimonial (linked to a specific completed order)
export const submitPlatformTestimonial = async (req: Request, res: Response) => {
  try {
    const { userId, orderId, rating, comment } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    // Check if the order exists and is completed
    const order = await Order.findOne({ _id: orderId, UserID: userId, Status: "Completed" });
    
    if (!order) {
      return res.status(403).json({ error: "Invalid order or order not completed." });
    }

    // Check if testimonial already exists for THIS order
    const existing = await PlatformTestimonial.findOne({ orderId: orderId });
    if (existing) {
      return res.status(400).json({ error: "You have already submitted a testimonial for this order." });
    }

    const testimonialData: any = {
      user: userId,
      orderId: orderId,
      status: "pending"
    };
    if (rating && Number(rating) > 0) testimonialData.rating = Number(rating);
    if (comment && comment.trim()) testimonialData.comment = comment.trim();

    const testimonial = await PlatformTestimonial.create(testimonialData);

    // We might want to increment the platform popup count on the order to prevent it from showing again? 
    // Or assume frontend handles it by calling the increment endpoint separately?
    // Based on "show to user only 1", and "add plateformfeedbackpopupcount to verivy", 
    // likely we should update the count too or let frontend handle it.
    // Let's assume frontend calls increment/max separately or we can do it here. 
    // But usually separation of concerns is better (submit is one thing, dismissing/closing popup is another).
    // However, if they submit, we surely don't want to show it again.
    
    // Auto-update the order count to max (e.g. 1 or 3) so it doesn't show again
    // The user said "show to user only 1".
    await Order.findByIdAndUpdate(orderId, { $set: { plateformFeedbackPopupCount: 1 } });


    res.status(201).json({ message: "Testimonial submitted successfully", testimonial });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    res.status(500).json({ error: "Failed to submit testimonial" });
  }
};

// Get all testimonials (Admin)
export const getAllPlatformTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await PlatformTestimonial.find()
      .populate("user", "name email profilePic")
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// Update testimonial status (Admin)
export const updatePlatformTestimonialStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const testimonial = await PlatformTestimonial.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({ message: "Testimonial status updated", testimonial });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// Get Approved Testimonials (Public - for displaying on website if needed later)
export const getApprovedPlatformTestimonials = async (req: Request, res: Response) => {
    try {
      const testimonials = await PlatformTestimonial.find({ status: "approved" })
        .populate("user", "name profilePic")
        .sort({ createdAt: -1 });
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching approved testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
};

// Count pending testimonials (for Admin Badge)
export const getPendingPlatformTestimonialCount = async (req: Request, res: Response) => {
  try {
    const count = await PlatformTestimonial.countDocuments({ status: "pending" });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending testimonial count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
