import api from "./api";

const API_URL = "/admin"; 

export interface PlatformTestimonial {
  _id: string;
  user: {
      name: string;
      email: string;
      profilePic?: string;
  } | null;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const getAllPlatformTestimonials = async (): Promise<PlatformTestimonial[]> => {
  const response = await api.get(`${API_URL}/testimonials`);
  return response.data;
};

export const updatePlatformTestimonialStatus = async (id: string, status: 'approved' | 'rejected') => {
  const response = await api.put(`${API_URL}/testimonials/${id}`, { status });
  return response.data;
};

export const getPendingPlatformTestimonialsCount = async (): Promise<{ count: number }> => {
  const response = await api.get(`${API_URL}/testimonials/pending-count`);
  return response.data;
};
