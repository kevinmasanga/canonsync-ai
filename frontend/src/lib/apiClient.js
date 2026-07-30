// lib/apiClient.js

import axios from "axios";

// Backend runs on port 3000 and mounts everything under /api/v1
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;

// ── Shows ─────────────────────────────────────────────────────────────────────

export async function getShows({ page = 1, limit = 20 } = {}) {
  const res = await apiClient.get("/shows", { params: { page, limit } });
  return res.data; // { data: Show[], pagination: {...} }
}

export async function getShowById(showId) {
  const res = await apiClient.get(`/shows/${showId}`);
  return res.data; // Show
}

export async function createShow({ title, description }) {
  const res = await apiClient.post("/shows", { title, description });
  return res.data; // Show
}

// ── Canon Facts ───────────────────────────────────────────────────────────────

export async function getCanonFacts({ show_id, page = 1, limit = 20 } = {}) {
  const res = await apiClient.get("/canon", { params: { show_id, page, limit } });
  return res.data; // { data: CanonFact[], pagination: {...} }
}

export async function createCanonFact({ show_id, category, fact_text, source_episode, author_name } = {}) {
  const res = await apiClient.post("/canon", { show_id, category, fact_text, source_episode, author_name });
  return res.data; // CanonFact
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function getSubmissions({ show_id, page = 1, limit = 100 } = {}) {
  const res = await apiClient.get("/submissions", { params: { show_id, page, limit } });
  return res.data; // { data: Submission[], pagination: {...} }
}

export async function createSubmission({ show_id, script, source_episode, author_name } = {}) {
  const res = await apiClient.post("/submissions", { show_id, script, source_episode, author_name });
  return res.data; // Submission
}

// ── Conflicts ─────────────────────────────────────────────────────────────────

export async function getConflicts({ submission_id, page = 1, limit = 100 } = {}) {
  const res = await apiClient.get("/conflicts", { params: { submission_id, page, limit } });
  return res.data; // { data: Conflict[], pagination: {...} }
}

export async function getConflictById(conflictId) {
  const res = await apiClient.get(`/conflicts/${conflictId}`);
  return res.data; // Conflict
}

export async function updateConflict(conflictId, { status, reasoning, confidence } = {}) {
  const res = await apiClient.patch(`/conflicts/${conflictId}`, { status, reasoning, confidence });
  return res.data; // Conflict
}