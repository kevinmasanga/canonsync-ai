// app/shows/[showId]/submit/page.jsx

"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import SceneForm from "@/components/scene/SceneForm";
import ProcessingState from "@/components/common/ProcessingState";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

export default function SubmitScenePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [episode, setEpisode] = useState("S04 E08: The Glass Horizon");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleCheckContinuity() {
    if (!content.trim()) {
      toast({
        title: "Scene text is empty",
        description: "Paste your scene before checking continuity.",
        variant: "warning",
      });
      return;
    }

    setIsProcessing(true);

    // TODO: replace with real flow:
    // const { sceneId } = await sceneApi.submit({ episode, title, content });
    // then poll conflictApi.get(sceneId) via usePollConflictStatus until status === "completed"
    await new Promise((r) => setTimeout(r, 3600));

    setIsProcessing(false);
    toast({
      title: "Continuity check complete",
      description: "2 conflicts found — opening the report.",
      variant: "warning",
    });

    router.push(`/shows/${params.showId}/conflicts/latest`);
  }

  return (
    <AppShell title="New Scene Entry">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {isProcessing ? (
          <ProcessingState />
        ) : (
          <>
            <SceneForm
              episode={episode}
              setEpisode={setEpisode}
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
            />

            <div className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Icon name="info" size={16} className="text-primary" />
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    AI will check this scene against your{" "}
                    <span className="font-semibold text-primary">canon store</span> for 14
                    character arcs and 3 world-building rules.
                  </p>
                </div>
                <p className="mt-1 font-label-caps text-[9px] text-outline-variant">
                  LAST SCAN: 2 MINUTES AGO • NO MAJOR CONFLICTS DETECTED
                </p>
              </div>
              <button
                onClick={handleCheckContinuity}
                className="flex items-center gap-3 rounded-full bg-primary-container px-8 py-4 font-bold text-on-primary-container shadow-lg shadow-primary-container/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Icon name="verified_user" filled />
                <span className="font-headline-sm text-headline-sm">Check Continuity</span>
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}