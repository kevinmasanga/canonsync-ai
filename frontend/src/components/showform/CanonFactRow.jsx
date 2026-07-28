// components/showform/CanonFactRow.jsx

import Icon from "@/components/common/Icon";

const CATEGORIES = [
  { value: "character", label: "Character" },
  { value: "event", label: "Event" },
  { value: "world_rule", label: "World Rule" },
];

export default function CanonFactRow({ row, onChangeCategory, onChangeText, onRemove }) {
  return (
    <div className="animate-fade-in group flex flex-col items-start gap-3 md:flex-row">
      <div className="flex shrink-0 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChangeCategory(row.id, c.value)}
            className={`rounded-full border px-3 py-1.5 font-label-caps text-label-caps transition-all ${
              row.category === c.value
                ? "active-pill border-transparent"
                : "border-outline-variant hover:border-primary"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="relative w-full flex-1">
        <input
          type="text"
          value={row.text}
          onChange={(e) => onChangeText(row.id, e.target.value)}
          placeholder="Add a fundamental truth about this element…"
          className="input-etched w-full rounded-lg px-4 py-1.5 pr-10 font-body-md text-body-md"
        />
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-error"
          aria-label="Remove fact"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}