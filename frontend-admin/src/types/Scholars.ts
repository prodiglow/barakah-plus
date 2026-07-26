export interface ScholarEducation {
  _id: string;
  name: string;
}

export interface ScholarServices {
  _id: string;
  name: string;
}

export interface ScholarSpecialization {
  _id: string;
  name: string;
}

export interface Reviewer {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
}

export interface ScholarReview {
  _id: string;
  reviewer: Reviewer;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Scholar {
  _id: string;
  scholarID: number;
  scholarName: string;
  scholarSpecialization: ScholarSpecialization[];
  scholarExperience: number;
  scholarEducation: ScholarEducation[];
  rating: number;
  ProfileImg: string;
  reviews: ScholarReview[];
  fee: number;         // 💵 New field
  blessings: number;
  scholarServices:ScholarServices[]; // 🙏 New field
  phone_number: string;
  gender: 'male' | 'female';
  sect: 'Shia' | 'Deobandi' | 'Barelvi' | 'Ahl-e-Hadith';
  createdAt?: string;
  updatedAt?: string;
}
