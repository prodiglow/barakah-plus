export interface Category {
  _id?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateDuaPayload {
  title: string;
  arabic_text: string;
  transliteration?: string;
  translation: string;
  reference?: string;
  virtue?: string;
  explanation?: string;
  audioUrl?: string;
  category: string[]; // IDs
  language?: string;
  repeat?: number;
  is_active?: boolean;
}

export interface UpdateDuaPayload extends Partial<CreateDuaPayload> {}
