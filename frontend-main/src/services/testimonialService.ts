import axios from "axios";
import {
  TestimonialResponse,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
} from "../types/testimonial";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/testimonial`; 
//const API_BASE_URL = "http://localhost:5000/api/testimonial"; 

// ✅ Get all testimonials
export const getTestimonials = async (): Promise<TestimonialResponse> => {
  const response = await axios.get(`${API_BASE_URL}`);
  return response.data;
};

// ✅ Get testimonials by scholar ID
export const getTestimonialsByScholar = async (
  scholarID: string
): Promise<TestimonialResponse> => {
  const response = await axios.get(`${API_BASE_URL}/scholar/${scholarID}`);
  return response.data;
};

// ✅ Get single testimonial
export const getTestimonialById = async (
  id: string
): Promise<TestimonialResponse> => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

// ✅ Add new testimonial
export const createTestimonial = async (
  payload: CreateTestimonialRequest
): Promise<TestimonialResponse> => {
  const response = await axios.post(`${API_BASE_URL}/`, payload);
  return response.data;
};

// ✅ Update existing testimonial
export const updateTestimonial = async (
  id: string,
  payload: UpdateTestimonialRequest
): Promise<TestimonialResponse> => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, payload);
  return response.data;
};

// ✅ Delete testimonial
export const deleteTestimonial = async (
  id: string
): Promise<TestimonialResponse> => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};
