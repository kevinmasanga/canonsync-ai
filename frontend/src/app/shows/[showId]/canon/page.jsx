// app/shows/[showId]/canon/page.jsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import FactCard from "@/components/canon/FactCard";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";
import { getCanonFacts, createCanonFact } from "@/lib/apiClient";

// All 8 categories from the backend enum
const CATEGORIES = ["character", "lore", "timeline", "location", "relationship", "event", "world_rule", "other"];
const FILTERS = ["All", ...CATEGORIES];

const FILTER_LABEL = {
  All: "All Rules",
  character: "Character",
  lore: "Lore",
  timeline: "Timeline",
  location: "Location",
  relationship: "Relationship",
  event: "Event",
  world_rule: "World Rule",
  other: "Other",
};

export default function CanonStorePage() {
  const params = useParams();
  const showId = params.showId;
  const { toast } = useToast();

  const [facts, setFacts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // ── Add-fact modal state ──────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("character");
  const [newFactText, setNewFactText] = useState("");
  const [newSourceEpisode, setNewSourceEpisode] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ── Fetch facts scoped to this show ──────────────────────────────────────
  useEffect(() => {
    if (!showId) return;
    setLoading(true);
    setError(null);
    getCanonFacts({ show_id: showId, limit: 100 })
      .then((result) => {
        setFacts(result.data);
        setPagination(result.pagination);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [showId]);

  // ── Client-side filter + search ───────────────────────────────────────────
  const filteredFacts = useMemo(() => {
    return facts.filter((fact) => {
      const matchesFilter = activeFilter === "All" || fact.category === activeFilter;
      const matchesSearch = fact.fact_text.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [facts, search, activeFilter]);

  // ── Save new fact ─────────────────────────────────────────────────────────
  async function handleSaveFact(e) {
    e.preventDefault();
    if (!newFactText.trim()) {
      toast({ title: "Fact text is required", variant: "warning" });
      return;
    }
    setIsSaving(true);
    try {
      const created = await createCanonFact({
        show_id: showId,
        category: newCategory,
        fact_text: newFactText.trim(),
        source_episode: newSourceEpisode.trim() || undefined,
        author_name: newAuthorName.trim() || undefined,
      });
      setFacts((prev) => [created, ...prev]);
      setPagination((prev) => prev ? { ...prev, total: prev.total + 1 } : prev);
      setModalOpen(false);
      setNewFactText("");
      setNewSourceEpisode("");
      setNewAuthorName("");
      setNewCategory("character");
      toast({ title: "Fact added", description: "New canon fact saved to the store.", variant: "success" });
    } catch (err) {
      toast({
        title: "Failed to save fact",
        description: err.response?.data?.error || err.message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCloseModal() {
    setModalOpen(false);
    setNewFactText("");
    setNewSourceEpisode("");
    setNewAuthorName("");
    setNewCategory("character");
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
              onClick={() => setModalOpen(true)}
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
                {FILTER_LABEL[filter]}
              </button>
            ))}
          </div>
        </section>

        {/* Loading / error / content */}
        {loading ? (
          <div className="glass-card flex items-center justify-center rounded-xl p-10">
            <p className="font-body-md text-body-md text-on-surface-variant">Loading facts…</p>
          </div>
        ) : error ? (
          <div className="glass-card flex items-center justify-center rounded-xl p-10">
            <p className="font-body-md text-body-md text-red-500">Failed to load facts: {error}</p>
          </div>
        ) : filteredFacts.length === 0 ? (
          <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-10 text-center">
            <Icon name="search_off" size={32} className="text-on-surface-variant" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              {facts.length === 0 ? "No facts yet. Add the first one!" : "No facts match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
            {filteredFacts.map((fact) => (
              <FactCard key={fact.canon_id} fact={fact} />
            ))}
            <button
              onClick={() => setModalOpen(true)}
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
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {pagination ? pagination.total : "—"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon name="verified" size={18} />
          <span className="font-label-caps text-label-caps">Canon Sync Active</span>
        </div>
      </footer>

      {/* ── Add Fact Modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div className="glass-card w-full max-w-lg rounded-2xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">New Canon Fact</h3>
              <button
                onClick={handleCloseModal}
                className="text-on-surface-variant hover:text-on-surface"
                aria-label="Close"
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSaveFact} className="flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  CATEGORY <span className="text-error">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input-etched rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{FILTER_LABEL[c]}</option>
                  ))}
                </select>
              </div>

              {/* Fact text */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  FACT <span className="text-error">*</span>
                </label>
                <textarea
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  rows={4}
                  placeholder="Describe the canon fact…"
                  className="input-etched resize-none rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Source episode */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  SOURCE EPISODE
                </label>
                <input
                  type="text"
                  value={newSourceEpisode}
                  onChange={(e) => setNewSourceEpisode(e.target.value)}
                  placeholder="e.g. S01 E03"
                  className="input-etched rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Author */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant">
                  AUTHOR NAME
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="e.g. jasper"
                  className="input-etched rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-outline-variant px-5 py-2.5 font-body-md text-body-md text-on-surface-variant hover:bg-surface-variant/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 font-bold text-on-primary-container disabled:opacity-60"
                >
                  {isSaving ? "Saving…" : "Save Fact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
