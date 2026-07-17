import api from "./api";

const API_URL = "/islamic-products";

export const getAllProducts = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

export const getProductsByCategory = async (category: string) => {
  const response = await api.get(`${API_URL}/category/${encodeURIComponent(category)}`);
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};
