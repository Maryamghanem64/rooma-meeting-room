import axios from "axios";

// Get API base URL from environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Log environment info in development
if (import.meta.env.DEV) {
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Environment: ${import.meta.env.MODE}`);
}

// Attach token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
