import axios from "axios";
import { Scholar } from "../types/Scholars";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/scholars`; 
//const API_URL = "http://localhost:5000/api/scholars"; 


export const fetchScholars = async (): Promise<Scholar[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const fetchScholarById = async (id: number): Promise<Scholar> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createScholar = async (data: Scholar): Promise<Scholar> => {
  const response = await axios.post(API_URL, data);
  return response.data;
};
