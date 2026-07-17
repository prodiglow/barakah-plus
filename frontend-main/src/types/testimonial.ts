// 🎓 Scholar info (if populated from backend)
export interface ScholarInfo {
  _id: string;
  scholarName: string;
  ProfileImg: string;
  scholarSpecialization?: string[]; // ✅ optional (not always included in API)
}

// 🙋‍♂️ User info (if populated)
export interface UserInfo {
  _id: string;
  name: string;
  profilePic?: string; // ✅ your backend uses `name` only, so optional is correct
}

// 💬 Main Testimonial type
export interface Testimonial {
  _id: string;
  userID: string | UserInfo; // ✅ matches the backend populated object
  scholarID: string | ScholarInfo; // ✅ same
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  location:string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number; // ✅ optional Mongoose version key
}

// ✅ API responses
export interface TestimonialResponse {
  success: boolean;
  message?: string; // ✅ sometimes missing in your API response
  data?: Testimonial | Testimonial[];
}

export interface CreateTestimonialRequest {
  userID: string;
  scholarID: string;
  rating: number;
  comment: string;
}

export interface UpdateTestimonialRequest {
  rating?: number;
  comment?: string;
  status?: "pending" | "approved" | "rejected";
}
