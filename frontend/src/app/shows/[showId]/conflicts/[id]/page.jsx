// app/shows/[showId]/conflicts/[id]/page.jsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";
import { getConflictById, updateConflict } from "@/lib/apiClient";

const STATUS_STYLE = {
  open:     { badge: "bg-error-container/20 text-error border-error/20",           label: "Open" },
  resolved: { badge: "bg-secondary-container/30 text-secondary border-secondary/20", label: "Resolved" },
  ignored:  { badge: "bg-surface-container text-on-surface-variant border-outline-variant", label: "Ignored" },
};

export default function ConflictDetailPage() {
  const params = useParams();
  const { toast } = useToast();

  const [conflict, setConflict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    setLoading(true);
    setError(null);
    getConflictById(params.id)
      .then(setConflict)
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleStatusChange(newStatus) {
    if (!conflict || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateConflict(conflict.conflict_id, { status: newStatus });
      setConflict(updated);
      toast({
        title: `Conflict marked as ${newStatus}`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.response?.data?.error || err.message,
        variant: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Conflict Analysis">
        <div className="glass-card flex items-center justify-center rounded-xl p-10">
          <p className="font-body-md text-body-md text-on-surface-variant">Loading conflict…</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Conflict Analysis">
        <div className="glass-card flex items-center justify-center rounded-xl p-10">
          <p className="font-body-md text-body-md text-red-500">Failed to load conflict: {error}</p>
        </div>
      </AppShell>
    );
  }

  if (!conflict) return null;

  const statusStyle = STATUS_STYLE[conflict.status] || STATUS_STYLE.open;

  return (
    <AppShell title="Conflict Analysis">
      <div className="flex flex-col gap-stack-loose">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h3 className="mb-2 font-display-lg text-display-lg">Conflict Detail</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary-container">
                <Icon name="warning" filled />
                <span className="font-headline-sm text-headline-sm font-bold tracking-tight">
                  Continuity Conflict
                </span>
              </div>
              <span
                className={`rounded border px-2 py-0.5 font-label-caps text-[10px] font-bold ${statusStyle.badge}`}
              >
                {statusStyle.label.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card space-y-6 rounded-xl p-6">
          {/* IDs + metadata */}
          <div className="grid grid-cols-1 gap-4 border-b border-outline-variant/30 pb-6 sm:grid-cols-2">
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Conflict ID</p>
              <p className="mt-1 font-data-point text-data-point break-all text-on-surface">
                {conflict.conflict_id}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Submission ID</p>
              <p className="mt-1 font-data-point text-data-point break-all text-on-surface">
                {conflict.submission_id}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Canon Fact ID</p>
              <p className="mt-1 font-data-point text-data-point break-all text-on-surface">
                {conflict.canon_id}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">
                Confidence
              </p>
              <p className="mt-1 font-headline-sm text-headline-sm text-on-surface">
                {conflict.confidence != null
                  ? `${Math.round(conflict.confidence * 100)}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Detected</p>
              <p className="mt-1 font-data-point text-data-point text-on-surface">
                {new Date(conflict.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-on-surface-variant">Last Updated</p>
              <p className="mt-1 font-data-point text-data-point text-on-surface">
                {new Date(conflict.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant">
              Reasoning
            </p>
            <p className="mt-2 font-body-md text-body-md leading-relaxed text-on-surface">
              {conflict.reasoning || (
                <span className="italic text-on-surface-variant">No reasoning provided.</span>
              )}
            </p>
          </div>

          {/* Actions */}
          {conflict.status === "open" && (
            <div className="flex flex-wrap gap-3 border-t border-outline-variant/30 pt-6">
              <p className="w-full font-label-caps text-label-caps text-on-surface-variant">
                RESOLVE CONFLICT
              </p>
              <button
                onClick={() => handleStatusChange("resolved")}
                disabled={isUpdating}
                className="rounded-lg bg-primary-container px-5 py-2.5 font-bold text-on-primary-container transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {isUpdating ? "Saving…" : "Mark Resolved"}
              </button>
              <button
                onClick={() => handleStatusChange("ignored")}
                disabled={isUpdating}
                className="rounded-lg border border-outline-variant px-5 py-2.5 font-body-md text-on-surface hover:bg-surface-variant/30 disabled:opacity-60"
              >
                Ignore
              </button>
            </div>
          )}

          {conflict.status !== "open" && (
            <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant/30 pt-6">
              <Icon
                name={conflict.status === "resolved" ? "check_circle" : "visibility_off"}
                size={16}
                className={conflict.status === "resolved" ? "text-secondary" : "text-on-surface-variant"}
              />
              <span className="font-body-md text-body-md text-on-surface-variant">
                This conflict is{" "}
                <span className="font-semibold text-on-surface">{conflict.status}</span>.
              </span>
              <button
                onClick={() => handleStatusChange("open")}
                disabled={isUpdating}
                className="ml-auto rounded border border-outline-variant px-4 py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-variant/30 disabled:opacity-60"
              >
                Re-open
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
