// lib/api/projectApi.js

import apiClient from "@/lib/apiClient";

export const projectApi = {
  async getById(projectId) {
    const { data } = await apiClient.get(`/projects/${projectId}`);
    return data; // { project, episodes, scenes }
  },

  async list() {
    const { data } = await apiClient.get("/projects");
    return data;
  },

  async create({ title, description, seedFacts }) {
    const { data } = await apiClient.post("/projects", {
      title,
      description,
      seedFacts,
    });
    return data;
  },

  async getFacts(projectId, { search, category } = {}) {
    const { data } = await apiClient.get(`/projects/${projectId}/facts`, {
      params: { search, category },
    });
    return data;
  },

  async addFact(projectId, fact) {
    const { data } = await apiClient.post(`/projects/${projectId}/facts`, fact);
    return data;
  },
};