// app/shows/[showId]/conflicts/page.jsx
// This is the page the sidebar's "Conflicts" link actually points to
// (/shows/[showId]/conflicts). It lists every scene with conflicts, each
// linking into the specific report at /shows/[showId]/conflicts/[id]
// (that report page was already built in Phase 2).

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";

// TODO: replace with data fetched from GET /api/conflicts (list, per project)
const CONFLICT_SUMMARIES = [
  {
    id: "latest",
    sceneTitle: "The Serengeti Paradox",
    episode: "S04 E08",
    conflictCount: 2,
    highestSeverity: "critical",
    submittedBy: "jasper",
    time: "2 hours ago",
  },
  {
    id: "sp-e02-v3",
    sceneTitle: "The Silent Pines — E02",
    episode: "S01 E02",
    conflictCount: 1,
    highestSeverity: "moderate",
    submittedBy: "m_chen",
    time: "Yesterday",
  },
];

const SEVERITY_DOT = {
  critical: "bg-error",
  moderate: "bg-secondary",
};

export default function ConflictsListPage({ params }) {
  return (
    <AppShell title="Conflicts">
      <div className="flex flex-col gap-stack-loose">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline-md text-headline-md">Flagged Scenes</h3>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Scenes with unresolved continuity conflicts across this show.
            </p>
          </div>
        </div>

        {CONFLICT_SUMMARIES.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-10 text-center">
            <Icon name="check_circle" filled size={32} className="text-success" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              No open conflicts. Everything checks out.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-card-gap">
            {CONFLICT_SUMMARIES.map((item) => (
              <Link
                key={item.id}
                href={`/shows/${params.showId}/conflicts/${item.id}`}
                className="glass-card flex items-center justify-between rounded-xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary-container/30 bg-primary-container/10 text-primary-container">
                    <Icon name="warning" filled />
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface">
                      {item.sceneTitle}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {item.episode} · submitted by {item.submittedBy} · {item.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[item.highestSeverity]}`} />
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    {item.conflictCount} conflict{item.conflictCount === 1 ? "" : "s"}
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