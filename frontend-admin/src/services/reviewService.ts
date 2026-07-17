export interface Review {
  _id: string;
  scholar: {
    _id: string;
    scholarName: string;
    ProfileImg?: string;
  };
  reviewer: {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
  };
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}



import api from "./api";

const API_BASE_URL = "/admin";

export const getAllReviews = async (): Promise<Review[]> => {
  const response = await api.get(`${API_BASE_URL}/reviews`);
  return response.data;
};

export const approveReview = async (id: string): Promise<Review> => {
  const response = await api.put(`${API_BASE_URL}/reviews/${id}/approve`);
  return response.data;
};

export const rejectReview = async (id: string): Promise<Review> => {
  const response = await api.put(`${API_BASE_URL}/reviews/${id}/reject`);
  return response.data;
};

export const getPendingReviewsCount = async (): Promise<{ count: number }> => {
  const response = await api.get(`${API_BASE_URL}/reviews/pending-count`);
  return response.data;
};
