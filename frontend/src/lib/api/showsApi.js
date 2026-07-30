// lib/api/showsApi.js
// Matches backend's shows.controller.js / shows.route.js (mounted at /api/v1/shows)

import apiClient from "@/lib/apiClient";

export const showsApi = {
  async getById(showId) {
    const { data } = await apiClient.get(`/shows/${showId}`);
    return data;
  },

  async list() {
    const { data } = await apiClient.get("/shows");
    return data; // { data: [...shows], pagination }
  },

  // "seedFacts" removed — backend's createShowSchema only accepts { title, description }.
  // Sending it did nothing but get silently stripped by Joi. The canon-seeding UI on
  // Create Show can stay for now, but until backend adds support, call canonApi.addFact()
  // once per seeded row, right after the show is created, instead of bundling it here.
  async create({ title, description }) {
    const { data } = await apiClient.post("/shows", { title, description });
    return data;
  },
};