import api from "./api";

// ✅ Base API URL (change if needed)
const API_URL = "/admin";

export interface AdminLoginResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

/** 🔐 Admin Login */
export const adminLogin = async (
  loginData: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const response = await api.post(`${API_URL}/login`, loginData);
  return response.data;
};

export const forgotPassword = async (data: { email?: string; phone?: string }) => {
  const response = await api.post(`${API_URL}/forgot-password`, data);
  return response.data;
};

export const resetPassword = async (data: { token: string; newPassword: string }) => {
  const response = await api.post(`${API_URL}/reset-password`, data);
  return response.data;
};

// User Management
export const getAllUsers = async () => {
    const response = await api.get(`${API_URL}/users`);
    return response.data;
};

export const updateUserByAdmin = async (id: string, data: any) => {
    const response = await api.put(`${API_URL}/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string) => {
    const response = await api.delete(`${API_URL}/users/${id}`);
    return response.data;
};
