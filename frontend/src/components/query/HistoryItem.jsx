// components/query/HistoryItem.jsx

"use client";

import Icon from "@/components/common/Icon";

export default function HistoryItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="glass-panel group overflow-hidden rounded-lg">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left transition-all hover:bg-surface-variant/20"
      >
        <div className="flex items-center gap-4">
          <Icon name="history" className="text-on-surface-variant group-hover:text-primary" />
          <span className="font-headline-sm text-headline-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
            {question}
          </span>
        </div>
        <Icon
          name="expand_more"
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="border-t border-outline-variant bg-surface-container-low px-14 py-6">
          <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}