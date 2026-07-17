import api from "./api";
import axios from "axios";

const USER_API_URL = "/user";

export const getUser = async (_token?: string) => {
  try {
    const response = await api.get(`${USER_API_URL}/getProfile`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Axios error fetching user:", error.response?.data || error.message);
      throw error.response?.data || { message: "Failed to fetch user" };
    } else {
      console.error("❌ Unknown error fetching user:", error);
      throw { message: "Unexpected error fetching user" };
    }
  }
};


export const updateUser = async (
  userId: string,
  _token: string, // Kept for backward compatibility, but ignored by api interceptor preferring logic 
  updatedData: { name?: string; email?: string; phone?: string; profilePic?: string }
) => {
  const response = await api.put(`${USER_API_URL}/update/${userId}`, updatedData);
  return response.data;
};
