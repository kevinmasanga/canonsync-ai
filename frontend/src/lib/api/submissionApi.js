// lib/api/submissionApi.js
// Matches backend's submission.controller.js / submission.route.js
// (mounted at /api/v1/submissions)

import apiClient from "@/lib/apiClient";

export const submissionApi = {
  // Backend's createSubmissionSchema expects: { show_id, script, author_name }
  // "episodeId" and "title" have no backend field at all — dropped.
  async submit({ showId, script, authorName }) {
    const { data } = await apiClient.post("/submissions", {
      show_id: showId,
      script,
      author_name: authorName,
    });
    return data;
  },

  // Previously missing — backend has GET /submissions?show_id=
  async list(showId) {
    const { data } = await apiClient.get("/submissions", {
      params: { show_id: showId },
    });
    return data; // { data: [...submissions], pagination }
  },
};