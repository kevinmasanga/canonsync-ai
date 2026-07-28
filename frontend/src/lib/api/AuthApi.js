// lib/api/authApi.js

import apiClient from "@/lib/apiClient";

export const authApi = {
  async login({ email, password }) {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data; // expected: { token, user }
  },

  async register({ fullName, email, password, role }) {
    const { data } = await apiClient.post("/auth/register", {
      fullName,
      email,
      password,
      role,
    });
    return data;
  },

  async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("canonsync_token");
    }
  },

  async getCurrentUser() {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};