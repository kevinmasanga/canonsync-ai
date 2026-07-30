// components/canon/FactList.jsx
// The Canon Store page currently renders its fact grid inline — this
// component extracts that into a reusable piece so the same grid can be
// reused elsewhere (e.g. Query page's cited-facts view, or a character
// detail page later).

import FactCard from "./FactCard";
import Icon from "@/components/common/Icon";

export default function FactList({ facts, onAddFact }) {
  if (!facts || facts.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-2 rounded-xl p-10 text-center">
        <Icon name="search_off" size={32} className="text-on-surface-variant" />
        <p className="font-body-md text-body-md text-on-surface-variant">
          No facts match your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-card-gap md:grid-cols-2 lg:grid-cols-3">
      {facts.map((fact) => (
        <FactCard key={fact.id} fact={fact} />
      ))}
      {onAddFact && (
        <button
          onClick={onAddFact}
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
      )}
    </div>
  );
}