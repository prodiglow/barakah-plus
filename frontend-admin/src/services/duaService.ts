import api from "./api";
import { Dua, CreateDuaPayload, UpdateDuaPayload } from "../types/dua";

const API_URL = "/duas";

// Get All Duas
export const getAllDuas = async (): Promise<Dua[]> => {
  const response = await api.get(API_URL);
  return response.data;
};

// Create New Dua
export const createDua = async (data: CreateDuaPayload): Promise<Dua> => {
  const response = await api.post(API_URL, data);
  return response.data;
};

// Update Dua
export const updateDua = async (id: string, data: UpdateDuaPayload): Promise<Dua> => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Delete Dua
export const deleteDua = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};

// Toggle Dua Status
export const toggleDuaStatus = async (id: string): Promise<Dua> => {
  const response = await api.patch(`${API_URL}/${id}/toggle-status`);
  return response.data;
};
