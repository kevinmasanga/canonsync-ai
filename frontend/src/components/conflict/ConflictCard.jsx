// components/conflict/ConflictCard.jsx

"use client";

import { useState } from "react";
import Icon from "@/components/common/Icon";
import ResolveActions from "./ResolveActions";

// NOTE: the Sprint Planning doc (Section 7) specifies binary confidence for V1 —
// a fact is either shown as a conflict (score ≥ 0.6) or not surfaced at all.
// The "CRITICAL / MODERATE" severity tag below is decorative only (mirrors the
// Stitch mockup) and isn't backed by a tiered-severity data model yet. Safe to
// remove the tag entirely, or wire it to real severity once/if that becomes V2 scope.
const SEVERITY_STYLE = {
  critical: "bg-error-container/20 text-error border-error/20",
  moderate: "bg-secondary-container/30 text-secondary border-secondary/20",
};

export default function ConflictCard({ conflict, showId }) {
  const [status, setStatus] = useState("pending");

  return (
    <div
      className={`glass-card space-y-4 rounded-xl p-6 transition-opacity ${
        status !== "pending" && status !== "revising" ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
            <Icon name={conflict.icon} filled />
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-primary-container">
              {conflict.category}
            </p>
            <p className="font-headline-sm text-headline-sm font-bold">{conflict.headline}</p>
          </div>
        </div>
        <span
          className={`rounded border px-2 py-1 text-[10px] font-bold ${
            SEVERITY_STYLE[conflict.severity]
          }`}
        >
          {conflict.severity.toUpperCase()}
        </span>
      </div>

      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
        <p className="font-body-md text-body-md leading-relaxed">
          Scene claims:{" "}
          <span className="font-bold text-on-surface">&ldquo;{conflict.claim}&rdquo;</span>
        </p>
      </div>

      <div className="flex items-start gap-4 border-l-2 border-primary-container bg-primary-container/5 p-4">
        <Icon name={conflict.citationIcon} className="text-primary-container" />
        <div className="space-y-1">
          <p className="font-label-caps text-label-caps text-on-surface-variant">
            CANON CITATION [{conflict.citationSource}]
          </p>
          <p className="font-body-md text-body-md text-on-surface">&ldquo;{conflict.citationFact}&rdquo;</p>
          <p className="text-[12px] italic text-on-surface-variant">— {conflict.citationCredit}</p>
        </div>
      </div>

      <ResolveActions showId={showId} status={status} onResolve={setStatus} />
    </div>
  );
}