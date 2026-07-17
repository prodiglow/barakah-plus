import api from "./api";
import { Category } from "../types/dua";

const API_URL = "/categories";

export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get(API_URL);
  return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post(API_URL, data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);
};
