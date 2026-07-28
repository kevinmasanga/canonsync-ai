// hooks/useFetch.js

"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * fetchFn must be a stable function (e.g. wrapped in useCallback by the caller)
 * that returns a promise resolving to the data you want.
 */
export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const cancel = refetch();
    return cancel;
  }, [refetch]);

  return { data, error, isLoading, refetch };
}