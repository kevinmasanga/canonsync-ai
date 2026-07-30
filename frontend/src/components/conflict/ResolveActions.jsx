// components/conflict/ResolveActions.jsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/common/Icon";
import { useToast } from "@/components/common/Toast";

export default function ResolveActions({ showId, status, onResolve }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showRetconField, setShowRetconField] = useState(false);
  const [retconReason, setRetconReason] = useState("");

  if (status === "revising") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-on-surface-variant">
        <Icon name="edit" size={16} />
        <span className="font-body-md text-body-md">Returning to Submit Scene…</span>
      </div>
    );
  }

  if (status === "retcon_confirmed") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-on-surface/10 px-4 py-2 text-on-surface">
        <Icon name="lock" size={16} />
        <span className="font-body-md text-body-md">Retcon Locked</span>
      </div>
    );
  }

  if (status === "dismissed") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-on-surface-variant opacity-60">
        <Icon name="visibility_off" size={16} />
        <span className="font-body-md text-body-md">Dismissed</span>
      </div>
    );
  }

  function handleRevise() {
    onResolve("revising");
    toast({ title: "Opening scene editor", variant: "info" });
    router.push(`/shows/${showId}/submit`);
  }

  function handleConfirmRetcon() {
    if (!showRetconField) {
      setShowRetconField(true);
      return;
    }
    if (!retconReason.trim()) {
      toast({
        title: "Reason required",
        description: "Add a short reason so the change is logged correctly.",
        variant: "warning",
      });
      return;
    }
    onResolve("retcon_confirmed");
    toast({
      title: "Retcon confirmed",
      description: "The change was logged. The original fact stays visible in history.",
      variant: "success",
    });
  }

  function handleDismiss() {
    onResolve("dismissed");
    toast({ title: "Conflict dismissed", variant: "info" });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRevise}
          className="rounded bg-primary-container px-4 py-2 font-bold text-on-primary-container transition-transform hover:scale-[1.02]"
        >
          Revise Scene
        </button>
        <button
          onClick={handleConfirmRetcon}
          className="rounded border border-outline-variant px-4 py-2 font-body-md text-on-surface hover:bg-surface-variant/30"
        >
          Confirm Retcon
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 font-medium text-on-surface-variant hover:text-on-surface"
        >
          Dismiss
        </button>
      </div>

      {showRetconField && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={retconReason}
            onChange={(e) => setRetconReason(e.target.value)}
            placeholder="Why is this an intentional change? (logged with your name)"
            className="input-etched flex-1 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface"
          />
          <button
            onClick={handleConfirmRetcon}
            className="rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary-container"
          >
            Log It
          </button>
        </div>
      )}
    </div>
  );
}