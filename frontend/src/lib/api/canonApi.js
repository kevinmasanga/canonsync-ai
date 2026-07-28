// lib/api/canonApi.js
// Matches backend's canon.controller.js / canon.route.js (mounted at /api/v1/canon)

import apiClient from "@/lib/apiClient";

export const canonApi = {
  // Backend expects: ?show_id=&page=&limit=  (snake_case, no search/category support yet)
  // Returns the full envelope: { data: [...facts], pagination: {...} }
  async getFacts(showId, { page = 1, limit = 20 } = {}) {
    const { data } = await apiClient.get("/canon", {
      params: { show_id: showId, page, limit },
    });
    return data; // caller must read result.data for the array, result.pagination for paging
  },

  // Backend's createCanonFactSchema requires: show_id, category, fact_text
  async addFact(showId, { category, factText }) {
    const { data } = await apiClient.post("/canon", {
      show_id: showId,
      category,
      fact_text: factText,
    });
    return data;
  },

  // Previously missing entirely — backend has PATCH /canon/:id
  async updateFact(factId, updates) {
    const { data } = await apiClient.patch(`/canon/${factId}`, updates);
    return data;
  },

  // Previously missing entirely — backend has DELETE /canon/:id
  async deleteFact(factId) {
    const { data } = await apiClient.delete(`/canon/${factId}`);
    return data;
  },
};