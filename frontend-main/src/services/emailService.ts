import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/email`;

export const sendOtp = async (to: string) => {
  const response = await axios.post(`${API_URL}/send`, { to });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await axios.post(`${API_URL}/verify`, { email, otp });
  return response.data;
};
export const sendPhoneOtp = async (phone: string) => {
  const response = await axios.post(`${API_URL}/send-phone`, { phone });
  return response.data;
};

export const verifyPhoneOtp = async (phone: string, otp: string) => {
  const response = await axios.post(`${API_URL}/verify-phone`, { phone, otp });
  return response.data;
};
