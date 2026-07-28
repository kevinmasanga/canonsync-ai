// lib/api/sceneApi.js

import apiClient from "@/lib/apiClient";

export const sceneApi = {
  async submit({ projectId, episodeId, title, content }) {
    const { data } = await apiClient.post("/scenes", {
      projectId,
      episodeId,
      title,
      content,
    });
    return data; // { sceneId, status: "processing" }
  },
};