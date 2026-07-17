import { Request, Response } from "express";
import { ScholarReview } from "../models/ScholarReview";

// Get all reviews (for admin dashboard)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await ScholarReview.find()
      .populate("scholar", "scholarName ProfileImg")
      .populate("reviewer", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Approve a review
export const approveReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await ScholarReview.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review approved", review });
  } catch (error) {
    console.error("Error approving review:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Reject a review
export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await ScholarReview.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review rejected", review });
  } catch (error) {
    console.error("Error rejecting review:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Count pending reviews (for Admin Badge)
export const getPendingReviewCount = async (req: Request, res: Response) => {
  try {
    const count = await ScholarReview.countDocuments({ status: "pending" });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending review count:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
