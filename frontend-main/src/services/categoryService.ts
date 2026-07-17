import api from "./api";
import { Category } from "./duaService";

// Fetch all categories
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data;
};
