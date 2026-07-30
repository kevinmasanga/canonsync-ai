// app/shows/[showId]/conflicts/page.jsx
// Lists conflicts for this show via a two-step fetch:
//   1. GET /api/v1/submissions?show_id=... to find all submissions for this show
//   2. GET /api/v1/conflicts?submission_id=... for each submission, then flatten
// This two-step approach is necessary because conflicts are scoped by submission_id,
// not show_id, in the backend schema.

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";
import { getSubmissions, getConflicts } from "@/lib/apiClient";

const STATUS_STYLE = {
  open:     "bg-error-container/20 text-error border-error/20",
  resolved: "bg-secondary-container/30 text-secondary border-secondary/20",
  ignored:  "bg-surface-container text-on-surface-variant border-outline-variant",
};

function confidenceLabel(confidence) {
  if (confidence == null) return null;
  return `${Math.round(confidence * 100)}% confidence`;
}

export default function ConflictsListPage() {
  const params = useParams();
  const showId = params.showId;

  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!showId) return;
    setLoading(true);
    setError(null);

    // Step 1: fetch all submissions for this show (up to 100)
    getSubmissions({ show_id: showId, limit: 100 })
      .then(async (submissionsResult) => {
        const submissions = submissionsResult.data;
        if (submissions.length === 0) {
          setConflicts([]);
          return;
        }
        // Step 2: fetch conflicts for each submission in parallel, then flatten
        const perSubmission = await Promise.all(
          submissions.map((sub) =>
            getConflicts({ submission_id: sub.submission_id, limit: 100 }).then((r) =>
              r.data.map((c) => ({ ...c, _submission: sub }))
            )
          )
        );
        setConflicts(perSubmission.flat());
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [showId]);

  return (
    <AppShell title="Conflicts">
      <div className="flex flex-col gap-stack-loose">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md">Flagged Conflicts</h3>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              All continuity conflicts detected across submissions for this show.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="glass-card flex items-center justify-center rounded-xl p-10">
            <p className="font-body-md text-body-md text-on-surface-variant">Loading conflicts…</p>
          </div>
        ) : error ? (
          <div className="glass-card flex items-center justify-center rounded-xl p-10">
            <p className="font-body-md text-body-md text-red-500">Failed to load conflicts: {error}</p>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-10 text-center">
            <Icon name="check_circle" filled size={32} className="text-success" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              No conflicts found. Everything checks out.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-card-gap">
            {conflicts.map((conflict) => (
              <Link
                key={conflict.conflict_id}
                href={`/shows/${showId}/conflicts/${conflict.conflict_id}`}
                className="glass-card flex items-center justify-between rounded-xl p-5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                    <Icon name="warning" filled />
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">
                      {conflict.reasoning
                        ? conflict.reasoning.slice(0, 80) + (conflict.reasoning.length > 80 ? "…" : "")
                        : "Conflict detected"}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Submission by {conflict._submission.author_name || "unknown"}{" "}
                      · {new Date(conflict.created_at).toLocaleDateString()}
                      {conflict.confidence != null && ` · ${confidenceLabel(conflict.confidence)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded border px-2 py-0.5 font-label-caps text-[10px] font-bold ${
                      STATUS_STYLE[conflict.status] || STATUS_STYLE.open
                    }`}
                  >
                    {conflict.status.toUpperCase()}
                  </span>
                  <Icon name="chevron_right" className="text-on-surface-variant" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
