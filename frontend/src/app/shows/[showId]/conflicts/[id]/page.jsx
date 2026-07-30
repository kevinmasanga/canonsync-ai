// app/shows/[showId]/conflicts/[id]/page.jsx

"use client";

import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ConflictCard from "@/components/conflict/ConflictCard";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

// TODO: replace with data fetched from GET /api/conflicts/:sceneId
const CONFLICTS = [
  {
    id: 1,
    icon: "report",
    citationIcon: "info",
    category: "GEOGRAPHICAL INCONSISTENCY",
    headline: "Location Impossibility",
    severity: "critical",
    claim: "Sarah boards the 8:00 AM express train from London Victoria to Paris.",
    citationSource: "S2.E04",
    citationFact: "Sarah has never left Nairobi.",
    citationCredit: "Established by Lead Writer in Script Version 4.2",
  },
  {
    id: 2,
    icon: "clock_loader_40",
    citationIcon: "calendar_month",
    category: "TIMELINE ERROR",
    headline: "Character Age Discrepancy",
    severity: "moderate",
    claim: "Tom celebrates his 30th birthday in the same week as the 2024 Lunar Eclipse.",
    citationSource: "S1.E01",
    citationFact: "Tom was born in 1998.",
    citationCredit: "Established in Pilot Character Bios",
  },
];

const NEW_FACTS = [
  { title: "Silver Fountain Pen", detail: "Added as Sarah's signature item." },
  { title: "Midnight Blue Suitcase", detail: "Primary luggage for character travel arc." },
];

const CHANGED_FACTS = [
  { title: "Train Departure Time", from: "07:45 AM", to: "08:00 AM" },
  { title: "Tom's Job Title", from: "Junior Clerk", to: "Senior Associate" },
];

export default function ConflictResultsPage() {
  const params = useParams();
  const { toast } = useToast();

  function handleExport() {
    // TODO: wire to real export endpoint
    toast({ title: "Export started", description: "Your report will download shortly.", variant: "info" });
  }

  return (
    <AppShell title="Conflict Analysis">
      <div className="flex flex-col gap-stack-loose">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h3 className="mb-2 font-display-lg text-display-lg">The Serengeti Paradox</h3>
            <div className="flex items-center gap-2 text-primary-container">
              <Icon name="warning" filled />
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight">
                {CONFLICTS.length} conflicts found
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="rounded-lg border border-outline-variant px-6 py-2 font-body-md text-body-md transition-all hover:bg-surface-variant/50"
            >
              Export Report
            </button>
            <button className="rounded-lg bg-primary-container px-6 py-2 font-bold text-on-primary-container shadow-[0px_4px_24px_rgba(255,138,61,0.12)] transition-all hover:opacity-90">
              Review All
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-card-gap lg:grid-cols-12">
          {/* Conflicts column */}
          <div className="space-y-stack-loose lg:col-span-8">
            <section>
              <h4 className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Active Conflicts
              </h4>
              <div className="space-y-card-gap">
                {CONFLICTS.map((conflict) => (
                  <ConflictCard key={conflict.id} conflict={conflict} showId={params.showId} />
                ))}
              </div>
            </section>
          </div>

          {/* Secondary column */}
          <div className="space-y-stack-loose lg:col-span-4">
            <section>
              <h4 className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                New Facts Identified
              </h4>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="space-y-3 p-4">
                  {NEW_FACTS.map((f) => (
                    <div
                      key={f.title}
                      className="flex items-center gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low/50 p-3 transition-all hover:border-primary/20"
                    >
                      <Icon name="add_circle" filled className="text-primary" />
                      <div>
                        <p className="font-bold text-on-surface" style={{ fontSize: "13px" }}>
                          {f.title}
                        </p>
                        <p className="text-[11px] text-on-surface-variant">{f.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h4 className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                Changed Facts
              </h4>
              <div className="glass-card overflow-hidden rounded-xl">
                <div className="space-y-3 p-4">
                  {CHANGED_FACTS.map((f) => (
                    <div
                      key={f.title}
                      className="flex items-start gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low/50 p-3 transition-all hover:border-primary/20"
                    >
                      <Icon name="published_with_changes" className="mt-1 text-secondary" />
                      <div>
                        <p className="font-bold text-on-surface" style={{ fontSize: "13px" }}>
                          {f.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[11px] line-through opacity-40">{f.from}</span>
                          <Icon name="arrow_forward" size={12} />
                          <span className="text-[11px] text-primary">{f.to}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}