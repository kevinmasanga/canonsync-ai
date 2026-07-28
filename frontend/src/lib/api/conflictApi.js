// lib/api/conflictApi.js

import apiClient from "@/lib/apiClient";

export const conflictApi = {
  async getBySceneId(sceneId) {
    const { data } = await apiClient.get(`/conflicts/${sceneId}`);
    return data; // { status, conflicts: [...] }
  },

  async resolve(conflictId, { action, reason }) {
    // action: "revise" | "confirm_retcon" | "dismiss"
    const { data } = await apiClient.post(`/conflicts/${conflictId}/resolve`, {
      action,
      reason,
    });
    return data;
  },
};