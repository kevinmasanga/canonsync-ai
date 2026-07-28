// lib/api/conflictApi.js
// Matches backend's conflict.controller.js / conflict.route.js

import apiClient from "@/lib/apiClient";

export const conflictApi = {
  // Was: GET /conflicts/:submissionId (path param — wrong, hits "get by conflict id" instead)
  // Backend actually expects: GET /conflicts?submission_id=
  async getBySubmissionId(submissionId) {
    const { data } = await apiClient.get("/conflicts", {
      params: { submission_id: submissionId },
    });
    return data; // { data: [...conflicts], pagination }
  },

  // Was: POST /conflicts/:id/resolve with { action, reason } — wrong method, wrong path, wrong body
  // Backend actually expects: PATCH /conflicts/:id with { status, reasoning }
  async resolve(conflictId, { status, reasoning }) {
    const { data } = await apiClient.patch(`/conflicts/${conflictId}`, {
      status,
      reasoning,
    });
    return data;
  },
};