// components/canon/FactCard.jsx

import Icon from "@/components/common/Icon";

const CATEGORY_STYLE = {
  character:    { icon: "person",      classes: "bg-primary/10 text-primary border-primary/20" },
  lore:         { icon: "auto_stories", classes: "bg-tertiary-container/20 text-tertiary border-tertiary/30" },
  timeline:     { icon: "schedule",    classes: "bg-secondary-container text-secondary border-outline-variant" },
  location:     { icon: "location_on", classes: "bg-primary/10 text-primary border-primary/20" },
  relationship: { icon: "group",       classes: "bg-tertiary-container/20 text-tertiary border-tertiary/30" },
  event:        { icon: "event_note",  classes: "bg-tertiary-container/20 text-tertiary border-tertiary/30" },
  world_rule:   { icon: "public",      classes: "bg-secondary-container text-secondary border-outline-variant" },
  other:        { icon: "label",       classes: "bg-surface-container text-on-surface-variant border-outline-variant" },
};

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function FactCard({ fact }) {
  const style = CATEGORY_STYLE[fact.category] || CATEGORY_STYLE.other;

  const sourceLabel = [fact.source_episode, fact.author_name]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="glass-card flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`flex items-center gap-2 rounded-md border px-2.5 py-1 ${style.classes}`}>
          <Icon name={style.icon} size={16} />
          <span className="font-label-caps text-label-caps capitalize">
            {fact.category.replace("_", " ")}
          </span>
        </div>
        <button className="text-on-surface-variant hover:text-on-surface" aria-label="Fact options">
          <Icon name="more_vert" />
        </button>
      </div>

      <p className="font-body-md text-body-md leading-relaxed text-on-surface">{fact.fact_text}</p>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 pt-4">
        <div className="flex items-center gap-2">
          <Icon name="history_edu" size={18} className="text-on-surface-variant" />
          <span className="font-data-point text-data-point text-on-surface-variant">
            {sourceLabel || "—"}
          </span>
        </div>
        <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50">
          {formatRelativeTime(fact.created_at)}
        </span>
      </div>
    </article>
  );
}
