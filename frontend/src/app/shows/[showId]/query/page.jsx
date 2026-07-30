// app/shows/[showId]/query/page.jsx
// AI-dependent feature — no backend query/vector-search endpoint exists yet.
// Replaced with a Coming Soon placeholder. Revisit once AI orchestration is live.

import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";

export default function QueryPage() {
  return (
    <AppShell title="Forensic Query">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container">
          <Icon name="auto_awesome" size={36} className="text-primary" />
        </div>

        <div className="space-y-3">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
            Canon Intelligence Engine
          </span>
          <h2 className="font-display-lg text-display-lg text-on-surface">
            What does the story know?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The Forensic Query feature uses vector search and AI reasoning to answer
            natural-language questions about your canon store.
          </p>
        </div>

        <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-5 text-left">
          <div className="flex items-center gap-3">
            <Icon name="construction" size={20} className="text-primary" />
            <p className="font-label-caps text-label-caps text-on-surface">
              Coming Soon
            </p>
          </div>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            This page will be enabled once the AI orchestration layer is complete.
            No backend query endpoint exists yet.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
