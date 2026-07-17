import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`; 

export const signupUser = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  profilePic?: string;
}) => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  return response.data;
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_URL}/login`, userData);
   localStorage.setItem("userId", response.data._id);
  return response.data;
};

export const checkUserExists = async (data: { email?: string; phone?: string }) => {
  const response = await axios.post(`${API_URL}/check-user`, data);
  return response.data;
};

export const forgotPassword = async (data: { email?: string; phone?: string }) => {
  const response = await axios.post(`${API_URL}/forgot-password`, data);
  return response.data;
};

export const resetPassword = async (data: { token: string; newPassword: string }) => {
  const response = await axios.post(`${API_URL}/reset-password`, data);
  return response.data;
};



