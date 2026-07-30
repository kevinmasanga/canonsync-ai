// components/canon/FactCard.jsx

import Icon from "@/components/common/Icon";

const CATEGORY_STYLE = {
  character: { icon: "person", classes: "bg-primary/10 text-primary border-primary/20" },
  event: {
    icon: "event_note",
    classes: "bg-tertiary-container/20 text-tertiary border-tertiary/30",
  },
  world_rule: {
    icon: "public",
    classes: "bg-secondary-container text-secondary border-outline-variant",
  },
};

export default function FactCard({ fact }) {
  const style = CATEGORY_STYLE[fact.category] || CATEGORY_STYLE.character;

  return (
    <article className="glass-card flex flex-col gap-4 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className={`flex items-center gap-2 rounded-md border px-2.5 py-1 ${style.classes}`}>
          <Icon name={style.icon} size={16} />
          <span className="font-label-caps text-label-caps capitalize">
            {fact.category.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fact.updated && (
            <span className="rounded bg-primary/20 px-2 py-0.5 font-label-caps text-label-caps text-primary">
              Updated
            </span>
          )}
          <button className="text-on-surface-variant hover:text-on-surface" aria-label="Fact options">
            <Icon name="more_vert" />
          </button>
        </div>
      </div>

      <p className="font-body-md text-body-md leading-relaxed text-on-surface">{fact.text}</p>

      <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 pt-4">
        <div className="flex items-center gap-2">
          <Icon name="history_edu" size={18} className="text-on-surface-variant" />
          <span className="font-data-point text-data-point text-on-surface-variant">
            {fact.source}
          </span>
        </div>
        <span className="font-label-caps text-[10px] text-on-surface-variant opacity-50">
          {fact.time}
        </span>
      </div>
    </article>
  );
}