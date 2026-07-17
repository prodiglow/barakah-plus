import axios from "axios";

// 👇 Adjust this to your backend base URL
//const API_BASE_URL = "http://localhost:5000/api/events";
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/events`; 

export interface EventData {
  _id?: string;
  eventID: number;
  eventTitle: string;
  eventSpecial: string;
  description: string;
  eventLocation: string;
  eventDate: string;
  eventPic: string;
  joiningLink?: string;
  isFeatured: boolean;
  showOnHomePage: boolean;
}

export interface EventResponse {
  message: string;
  event: EventData;
}

export const eventService = {
  // ➕ CREATE EVENT
  createEvent: async (data: EventData) => {
    const response = await axios.post(`${API_BASE_URL}/create`, data);
    return response.data;
  },

  // 📋 GET ALL EVENTS
  getAllEvents: async () => {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // 🔍 GET EVENT BY ID
  getEventById: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // ✏️ UPDATE EVENT
  updateEvent: async (id: string, data: Partial<EventData>) => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  // ❌ DELETE EVENT
  deleteEvent: async (id: string) => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },
};
