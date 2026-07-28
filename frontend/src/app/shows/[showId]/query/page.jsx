// app/shows/[showId]/query/page.jsx

"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";
import HistoryItem from "@/components/query/HistoryItem";
import { useToast } from "@/components/common/Toast";

// TODO: replace with data fetched from the query endpoint
const HISTORY = [
  {
    question: "How many times has the Blue Pendant been mentioned in Season 3?",
    answer:
      'The "Blue Pendant" has appeared 7 times across 5 episodes in Season 3. It is currently in the possession of Marcus, though its location was last confirmed at the Harbor Safehouse.',
  },
  {
    question: "Is there a conflict with the timeline of the Great Fire?",
    answer:
      "Yes. Episode 3 mentions the Great Fire occurring in 1912, while the Pilot established it as 1914. This is flagged as a continuity conflict affecting 3 character backstories.",
  },
];

const SOURCES = [
  { icon: "description", label: "S2E04 Script (Final)" },
  { icon: "person", label: "Character Bio: Sarah" },
  { icon: "map", label: "Portland Locations" },
];

export default function QueryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [openHistoryIndex, setOpenHistoryIndex] = useState(null);

  async function handleSearch() {
    if (!query.trim()) {
      toast({ title: "Type a question first", variant: "warning" });
      return;
    }
    setIsSearching(true);
    setAnswer(null);

    // TODO: replace with real queryApi.ask(query)
    await new Promise((r) => setTimeout(r, 1200));

    setAnswer(
      "Sarah Jenkins' family history is established primarily in Season 2, Episode 4 (\"The Ghost in the Attic\"). Her father, Arthur, was a local archivist who disappeared in 1998, leaving behind a series of encrypted journals. Her mother, Elena, resides in a care facility in Portland."
    );
    setIsSearching(false);
  }

  return (
    <AppShell title="Forensic Query">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-6">
        {/* Query input */}
        <section className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
              Canon Intelligence Engine
            </span>
            <h2 className="font-display-lg text-display-lg text-on-surface">
              What does the story know?
            </h2>
          </div>
          <div className="glass-panel relative w-full max-w-3xl rounded-full transition-all duration-300 focus-within:border-primary focus-within:shadow-[0_0_20px_rgba(255,138,61,0.15)]">
            <Icon
              name="auto_awesome"
              size={24}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-primary"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. What do we know about Sarah's family?"
              className="w-full border-none bg-transparent py-6 pl-16 pr-32 font-headline-sm text-headline-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-0"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-primary px-6 py-3 font-body-md font-bold text-on-primary transition-transform active:scale-95 disabled:opacity-60"
            >
              {isSearching ? "…" : "Search"}
            </button>
          </div>
        </section>

        {/* Results + history */}
        <div className="flex flex-col gap-8">
          {answer && (
            <div className="glass-panel animate-fade-in flex flex-col gap-6 rounded-xl border-l-4 border-l-primary p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-label-caps text-label-caps text-primary">
                    Primary Analysis
                  </span>
                  <span className="font-body-md text-on-surface-variant opacity-50">Just now</span>
                </div>
                <button className="text-on-surface-variant transition-colors hover:text-primary">
                  <Icon name="share" />
                </button>
              </div>
              <p className="font-headline-sm text-headline-sm leading-relaxed text-on-surface">
                {answer}
              </p>
              <div className="space-y-3">
                <h4 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  Sources &amp; Evidence
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((s) => (
                    <button
                      key={s.label}
                      className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 transition-colors hover:border-primary"
                    >
                      <Icon name={s.icon} size={16} className="text-primary" />
                      <span className="font-data-point text-data-point">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 py-4">
            <div className="h-[1px] flex-1 bg-outline-variant" />
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
              Previous Inquiries
            </span>
            <div className="h-[1px] flex-1 bg-outline-variant" />
          </div>

          <div className="flex flex-col gap-3">
            {HISTORY.map((item, i) => (
              <HistoryItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openHistoryIndex === i}
                onToggle={() => setOpenHistoryIndex(openHistoryIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}