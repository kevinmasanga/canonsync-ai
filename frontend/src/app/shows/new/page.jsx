// app/shows/new/page.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import Icon from "@/components/common/Icon";
import CanonFactRow from "@/components/showform/CanonFactRow";
import { useToast } from "@/components/common/Toast";
import { createShow, createCanonFact } from "@/lib/apiClient";

let nextId = 3;

export default function CreateShowPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState([
    { id: 1, category: "character", text: "" },
    { id: 2, category: "event", text: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addRow() {
    setRows((prev) => [...prev, { id: nextId++, category: "character", text: "" }]);
  }

  function removeRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateCategory(id, category) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category } : r)));
  }

  function updateText(id, text) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, text } : r)));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  if (!title.trim()) {
    toast({ title: "Show title is required", variant: "warning" });
    return;
  }

  setIsSubmitting(true);
  try {
    const show = await createShow({ title, description });

    const factRows = rows.filter((r) => r.text.trim());
    const factResults = await Promise.allSettled(
      factRows.map((r) =>
        createCanonFact({
          show_id: show.show_id,
          category: r.category,
          fact_text: r.text,
        })
      )
    );

    const failedCount = factResults.filter((r) => r.status === "rejected").length;

    if (failedCount > 0) {
      toast({
        title: "Show created, but some facts failed",
        description: `${failedCount} of ${factRows.length} seed facts could not be saved.`,
        variant: "warning",
      });
    } else {
      toast({
        title: "Show created",
        description: `"${title}" is ready. Canon store initialized.`,
        variant: "success",
      });
    }

    router.push("/");
  } catch (err) {
    toast({
      title: "Failed to create show",
      description: err.response?.data?.error || err.message,
      variant: "error",
    });
  } finally {
    setIsSubmitting(false);
  }
}

  function handleSaveDraft() {
    toast({ title: "Draft saved", variant: "info" });
  }

  return (
    <AppShell title="Create Show">
      <div className="mx-auto max-w-3xl py-4">
        <div className="mb-10 text-center">
          <h1 className="mb-2 font-display-lg text-display-lg">Create a New Show</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Establish the foundational narrative architecture for your project.
          </p>
        </div>

        <div className="glass-card rounded-xl p-8 shadow-xl">
          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Core identity */}
            <section className="space-y-6">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="info" size={16} className="text-primary" />
                <h3 className="font-label-caps text-label-caps tracking-[0.2em] text-primary">
                  CORE IDENTITY
                </h3>
              </div>
              <div className="space-y-2">
                <label className="ml-1 block font-label-caps text-label-caps text-on-surface-variant">
                  SHOW TITLE
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Shadows: District 9"
                  className="input-etched w-full rounded-lg px-4 py-3 font-headline-sm text-on-surface placeholder:text-surface-variant"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 block font-label-caps text-label-caps text-on-surface-variant">
                  DESCRIPTION
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Briefly describe the series' premise, tone, and main conflict…"
                  className="input-etched w-full resize-none rounded-lg px-4 py-3 font-body-md text-on-surface placeholder:text-surface-variant"
                />
              </div>
            </section>

            {/* Seed canon */}
            <section className="space-y-6 border-t border-outline-variant pt-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="database" size={16} className="text-primary" />
                  <h3 className="font-label-caps text-label-caps tracking-[0.2em] text-primary">
                    SEED INITIAL CANON
                  </h3>
                </div>
                <span className="text-[10px] text-on-surface-variant opacity-60">
                  ADD PRE-EXISTING LORE FACTS
                </span>
              </div>

              <div className="space-y-4">
                {rows.map((row) => (
                  <CanonFactRow
                    key={row.id}
                    row={row}
                    onChangeCategory={updateCategory}
                    onChangeText={updateText}
                    onRemove={removeRow}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="group flex items-center gap-2 px-2 py-1 text-on-surface-variant transition-all hover:text-primary"
              >
                <Icon name="add_circle" size={16} className="transition-transform group-hover:scale-110" />
                <span className="font-label-caps text-label-caps">ADD ANOTHER FACT</span>
              </button>
            </section>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 border-t border-outline-variant/30 pt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-primary-container py-4 font-headline-sm text-headline-sm font-bold text-surface-container-lowest shadow-lg shadow-primary-container/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 md:w-64"
              >
                {isSubmitting ? "Creating…" : "Create Show"}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="border-b border-transparent pb-0.5 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:border-on-surface-variant hover:text-on-surface"
              >
                SAVE AS DRAFT
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}