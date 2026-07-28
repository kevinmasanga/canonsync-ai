// components/common/ProcessingState.jsx

"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function ProcessingState({
  steps = ["Extracting facts…", "Comparing against canon…", "Compiling report…"],
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (steps.length <= 1) return;
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-6 rounded-xl p-16 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <span className="absolute h-12 w-12 rounded-full bg-primary/10" />
        <Icon name="auto_awesome" filled size={28} className="relative text-primary" />
      </div>
      <div>
        <p className="font-headline-sm text-headline-sm text-on-surface">Analyzing scene…</p>
        <p className="mt-2 font-body-md text-body-md text-on-surface-variant">{steps[stepIndex]}</p>
      </div>
    </div>
  );
}