// lib/constants.js

export const CONFIDENCE_THRESHOLD = 0.6; // V1 binary cutoff — see Sprint Planning §7

export const FACT_CATEGORIES = {
  CHARACTER: "character",
  EVENT: "event",
  WORLD_RULE: "world_rule",
};

export const SCENE_STATUS = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const CONFLICT_RESOLUTION = {
  PENDING: "pending",
  REVISING: "revising",
  RETCON_CONFIRMED: "retcon_confirmed",
  DISMISSED: "dismissed",
};

export const TOAST_VARIANT = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";