// lib/apiClient.js
// Old skeleton called this src/api/axiosClient.js — under the Next.js
// architecture it lives here. Every file in lib/api/ imports this shared
// instance instead of configuring axios itself. Run: npm install axios

import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("canonsync_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401s globally — token expired/invalid
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("canonsync_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;