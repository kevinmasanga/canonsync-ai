// lib/apiClient.js

import axios from "axios";

// Was: http://localhost:5000/api  (wrong port, missing version prefix)
// Backend actually runs on port 3000 and mounts everything under /api/v1
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;