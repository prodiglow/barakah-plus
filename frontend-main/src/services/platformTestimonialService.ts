import axios from "axios";

// Base API URL
// @ts-ignore
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`; 

export const submitPlatformTestimonial = async (token: string, data: { userId: string, orderId: string, rating: number, comment: string }) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const response = await axios.post(`${API_URL}/user/testimonial`, data, { headers });
  return response.data;
};

export const getApprovedPlatformTestimonials = async () => {
    const response = await axios.get(`${API_URL}/user/testimonials/public`);
    return response.data;
};
