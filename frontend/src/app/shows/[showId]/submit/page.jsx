// app/shows/[showId]/submit/page.jsx

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SceneForm from "@/components/scene/SceneForm";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";
import { createSubmission } from "@/lib/apiClient";

export default function SubmitScenePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [sourceEpisode, setSourceEpisode] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) {
      toast({
        title: "Scene text is empty",
        description: "Paste your scene before submitting.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createSubmission({
        show_id: params.showId,
        script: content.trim(),
        source_episode: sourceEpisode.trim() || undefined,
      });
      setSubmitted(true);
      toast({
        title: "Scene submitted",
        description: "Your script has been saved and queued for review.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err.response?.data?.error || err.message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell title="New Scene Entry">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20">
            <Icon name="check_circle" filled size={36} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-headline-md text-headline-md text-on-surface">Scene Submitted</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your script has been saved and is pending review.
            </p>
            <p className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-label-caps text-[11px] text-on-surface-variant">
              ⏳ Continuity check is coming soon — AI orchestration is not yet active.
              You will be notified once the review layer is live.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setContent(""); setSourceEpisode(""); }}
              className="rounded-lg border border-outline-variant px-6 py-2.5 font-body-md text-body-md text-on-surface-variant hover:bg-surface-variant/30"
            >
              Submit Another
            </button>
            <button
              onClick={() => router.push(`/shows/${params.showId}/conflicts`)}
              className="rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary-container"
            >
              View Conflicts
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Scene Entry">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <SceneForm
          sourceEpisode={sourceEpisode}
          setSourceEpisode={setSourceEpisode}
          content={content}
          setContent={setContent}
        />

        <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Icon name="info" size={16} className="text-primary" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Submit your scene to the{" "}
                <span className="font-semibold text-primary">canon store</span> for continuity review.
              </p>
            </div>
            <p className="mt-1 rounded border border-outline-variant/40 bg-surface-container-lowest px-3 py-1.5 font-label-caps text-[10px] text-on-surface-variant">
              ⏳ AI CONTINUITY CHECK — COMING SOON · SUBMISSION WILL BE QUEUED FOR REVIEW
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-3 rounded-full bg-primary-container px-8 py-4 font-bold text-on-primary-container shadow-lg shadow-primary-container/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            <Icon name="upload_file" filled />
            <span className="font-headline-sm text-headline-sm">
              {isSubmitting ? "Submitting…" : "Submit Scene"}
            </span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
