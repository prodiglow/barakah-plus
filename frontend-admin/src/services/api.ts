import axios from "axios";

// Determine API Base URL (set VITE_API_BASE_URL to the backend origin, no trailing /api)
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api`;

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!config.url?.includes("/login")) {
      console.warn("⚠️ No Admin Token found in localStorage!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
