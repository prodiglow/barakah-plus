import axios from "axios";
import { authEvents } from "../utils/authEvents";

// Determine API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to auto-logout on token expiry (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear session
      const wasLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (wasLoggedIn) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("isLoggedIn");
        // Notify all listeners (navbar, header, etc.) to update auth state
        authEvents.dispatch();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
