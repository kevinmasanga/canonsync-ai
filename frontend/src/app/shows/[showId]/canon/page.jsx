// app/shows/[showId]/canon/page.jsx

"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import FactCard from "@/components/canon/FactCard";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

const FILTERS = ["All Rules", "Character", "Event", "World Rule"];

// TODO: replace with data fetched from GET /api/projects/:id (facts)
const FACTS = [
  {
    id: 1,
    category: "character",
    text: 'Commander Elias Vane suffers from chronic insomnia due to the "Void-Pulse" incident during the Siege of Orion. He requires a neural-relinker every 48 hours to prevent synaptic collapse.',
    source: "Episode 2 · jasper",
    time: "2h ago",
    updated: true,
  },
  {
    id: 2,
    category: "world_rule",
    text: "FTL travel within the Aurelia Nebula is prohibited during solar flares. High-energy particles interact with the warp drive, causing permanent temporal displacement of the crew.",
    source: "Episode 1 · elara_script",
    time: "1d ago",
  },
  {
    id: 3,
    category: "event",
    text: "The Treaty of Kaelo-4 was signed in blood, literally. The DNA of both regents is encoded into the holographic seal, and any breach triggers a biological containment failsafe.",
    source: "Episode 3 · m_chen",
    time: "5h ago",
  },
  {
    id: 4,
    category: "character",
    text: "Kaelith of the High Marches never uses her left hand for magic. It was revealed in the flashback sequence that her left hand was replaced with a prosthetic made of obsidian.",
    source: "Episode 2 · jasper",
    time: "3d ago",
  },
  {
    id: 5,
    category: "world_rule",
    text: 'Memory harvesting is restricted to the "End-of-Life" protocol. Illegal harvesting of active memories causes "Shatter-Brain" syndrome in the donor, making the data unreadable.',
    source: "Episode 4 · prod_admin",
    time: "Just now",
    updated: true,
  },
];

const CATEGORY_TO_FILTER = {
  character: "Character",
  event: "Event",
  world_rule: "World Rule",
};

export default function CanonStorePage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Rules");

  const filteredFacts = useMemo(() => {
    return FACTS.filter((fact) => {
      const matchesFilter =
        activeFilter === "All Rules" || CATEGORY_TO_FILTER[fact.category] === activeFilter;
      const matchesSearch = fact.text.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  function handleAddFact() {
    // TODO: open a real "add fact" form/modal wired to canonApi
    toast({
      title: "Fact added",
      description: "New canon fact saved to the store.",
      variant: "success",
    });
  }

  return (
    <AppShell title="Canon Store">
      <div className="flex flex-col gap-stack-loose">
        {/* Search + filters */}
        <section>
          <div className="flex flex-col justify-between gap-card-gap md:flex-row md:items-center">
            <div className="group relative max-w-xl flex-1">
              <Icon
                name="search"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search narrative facts, character rules, or episode data…"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pl-12 pr-4 font-body-md text-body-md transition-all duration-300 placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleAddFact}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-data-point text-data-point text-on-primary-container transition-colors hover:bg-primary"
            >
              <Icon name="add" />
              ADD FACT
            </button>
          </div>

          <div className="mt-stack-loose flex flex-wrap gap-3">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full border px-4 py-1.5 font-label-caps text-label-caps transition-colors ${
                  activeFilter === filter
                    ? "active-pill border-transparent"
                    : "border-outline-variant text-on-surface-variant hover:border-primary/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Fact grid */}
        {filteredFacts.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-10 text-center">
            <Icon name="search_off" size={32} className="text-on-surface-variant" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              No facts match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
            {filteredFacts.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))}
            <button
              onClick={handleAddFact}
              className="group flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant p-8 transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary group-hover:text-black">
                <Icon name="add" size={28} />
              </div>
              <div className="text-center">
                <h4 className="font-headline-sm text-headline-sm text-on-surface">
                  Document New Fact
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Ensure continuity across the writers&rsquo; room.
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <footer className="mt-stack-loose flex flex-wrap items-center justify-between gap-4 rounded-xl border-t border-outline-variant bg-surface-container-lowest/50 p-container-padding">
        <div className="flex gap-stack-loose">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">
              Total Facts
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface">1,248</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">
              Conflicts Resolved
            </span>
            <span className="font-headline-sm text-headline-sm text-primary">342</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">
              Contributors
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface">12</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon name="verified" size={18} />
          <span className="font-label-caps text-label-caps">Canon Sync Active</span>
        </div>
      </footer>
    </AppShell>
  );
}