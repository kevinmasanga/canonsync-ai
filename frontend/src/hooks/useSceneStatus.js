// hooks/useSceneStatus.js

"use client";

import { useEffect, useRef, useState } from "react";
import { conflictApi } from "@/lib/api/conflictApi";
import { SCENE_STATUS } from "@/lib/constants";

/**
 * Polls GET /api/conflicts/:sceneId until status flips to "completed" (or "failed").
 * Mirrors the async flow from the Sprint Planning doc: submit -> processing -> completed.
 */
export function useSceneStatus(sceneId, { intervalMs = 2500, enabled = true } = {}) {
  const [status, setStatus] = useState(sceneId ? SCENE_STATUS.PROCESSING : null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sceneId || !enabled) return;

    let cancelled = false;

    async function poll() {
      try {
        const data = await conflictApi.getBySceneId(sceneId);
        if (cancelled) return;

        setStatus(data.status);
        if (data.status === SCENE_STATUS.COMPLETED) {
          setResult(data);
          return; // stop polling
        }
        timerRef.current = setTimeout(poll, intervalMs);
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setStatus(SCENE_STATUS.FAILED);
        }
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sceneId, enabled, intervalMs]);

  return { status, result, error, isProcessing: status === SCENE_STATUS.PROCESSING };
}