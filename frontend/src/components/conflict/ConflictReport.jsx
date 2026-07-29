// components/conflict/ConflictReport.jsx
// Wraps the full report: header summary + list of ConflictCards. The
// Conflict Results page currently inlines this same logic directly — swap in
// this component there if you'd rather keep that page file thinner.

import Icon from "@/components/common/Icon";
import ConflictCard from "./ConflictCard";

export default function ConflictReport({ sceneTitle, conflicts, showId }) {
  return (
    <section className="flex flex-col gap-stack-loose">
      <div className="flex items-center gap-2 text-primary-container">
        <Icon name="warning" filled />
        <span className="font-headline-sm text-headline-sm font-bold tracking-tight">
          {conflicts.length === 0
            ? "No conflicts — all clear"
            : `${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} found`}
        </span>
      </div>

      {conflicts.length === 0 ? (
        <div className="glass-card flex items-center gap-3 rounded-xl p-6">
          <Icon name="check_circle" filled className="text-success" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            &ldquo;{sceneTitle}&rdquo; is consistent with your canon store.
          </p>
        </div>
      ) : (
        <div className="space-y-card-gap">
          {conflicts.map((conflict) => (
            <ConflictCard key={conflict.id} conflict={conflict} showId={showId} />
          ))}
        </div>
      )}
    </section>
  );
}