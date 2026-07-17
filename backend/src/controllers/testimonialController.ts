import { Request, Response } from "express";
import Testimonial from "../models/Testimonial";

// ✅ Add a new testimonial
export const addTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userID, scholarID, orderID, rating, comment } = req.body;

    if (!userID || !scholarID || !rating || !comment) {
      res.status(400).json({ success: false, message: "Missing required fields" });
      return;
    }

    const testimonial = await Testimonial.create({
      userID,
      scholarID,
      orderID,
      rating,
      comment,
      status: "approved", // change to 'pending' if moderation needed
    });

    res.status(201).json({
      success: true,
      message: "Testimonial added successfully",
      data: testimonial,
    });
  } catch (error: any) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all approved testimonials
export const getAllTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" })
      .populate("userID", "name ProfileImg")
      .populate("scholarID", "scholarName ProfileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: testimonials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get testimonials by scholar ID
export const getScholarTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scholarID } = req.params;
    const testimonials = await Testimonial.find({ scholarID, status: "approved" })
      .populate("userID", "name ProfileImg")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: testimonials });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Approve a testimonial (Admin)
export const approveTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!testimonial) {
      res.status(404).json({ success: false, message: "Testimonial not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Testimonial approved successfully",
      data: testimonial,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete testimonial
export const deleteTestimonial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Testimonial not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
