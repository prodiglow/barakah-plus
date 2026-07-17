import api from "./api";

export interface Category {
  title: string;
  image?: string;
  description?: string;
}

export interface Dua {
  _id: string;
  title: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  virtue?: string;
  explanation?: string;
  audioUrl?: string;
  category: Category[];
  language: string;
  repeat: number;
  is_active: boolean;
}

export const getAllDuas = async (): Promise<Dua[]> => {
  const response = await api.get("/duas");
  // Assuming the public endpoint returns all, you might filter active here or in the component if the backend returns inactive ones too.
  // Ideally backend should support ?active=true query, but for now filtering in frontend is fine as per seed data.
  // Actually the controller `getAllDuas` likely returns all.
  return response.data;
};

export const getDuasByCategory = async (categoryId: string): Promise<Dua[]> => {
  const response = await api.get(`/duas?category=${categoryId}&active=true`);
  return response.data;
};
