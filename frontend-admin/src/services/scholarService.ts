import api from "./api";
import { Scholar } from "../types/Scholars";

const API_URL = "/scholars";
const UPLOAD_API_URL = "";

/** Scholar gender — must match backend enum exactly (lowercase) */
export type ScholarGender = 'male' | 'female';

/** Scholar sect — must match backend enum exactly */
export type ScholarSect = 'Shia' | 'Deobandi' | 'Barelvi' | 'Ahl-e-Hadith';

/** Create Scholar Request */
export interface CreateScholarRequest {
  scholarName: string;
  scholarSpecialization: string[];
  scholarExperience: number;
  scholarEducation: string[];
  ProfileImg: string;
  fee: number;
  scholarServices: string[];
  phone_number: string;
  rating: number;
  blessings: number;
  gender: ScholarGender;
  sect: ScholarSect;
}

export const fetchScholars = async (): Promise<Scholar[]> => {
  const response = await api.get(API_URL);
  return response.data;
};

export const fetchScholarById = async (id: number): Promise<Scholar> => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const createScholar = async (data: CreateScholarRequest): Promise<Scholar> => {
  const response = await api.post(API_URL, data);
  return response.data;
};

/** 📷 Upload Image File */
export interface UploadImageResponse {
  message: string;
  url: string;
  public_id: string;
}

export const uploadImage = async (imageFile: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.post(`${UPLOAD_API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const updateScholar = async (id: string, data: Partial<CreateScholarRequest>): Promise<Scholar> => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteScholar = async (id: string): Promise<void> => {
  await api.delete(`${API_URL}/${id}`);

};
 