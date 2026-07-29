// components/dashboard/ShowCard.jsx

import Link from "next/link";

const STATUS_DOT = {
  active: "bg-green-400",
  conflicts: "bg-primary-container",
  reviewing: "bg-on-tertiary-container",
};

export default function ShowCard({ show }) {
  return (
    <Link
      href={`/shows/${show.id}/canon`}
      className="glass-card group block cursor-pointer overflow-hidden rounded-xl"
    >
      <div className="relative h-48 w-full">
        <img
          src={show.image}
          alt={`${show.title} cover art`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent opacity-60" />
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[show.status] || "bg-secondary"}`} />
          <span className="font-label-caps text-label-caps">{show.statusLabel}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h5 className="font-headline-sm text-headline-sm text-on-surface">{show.title}</h5>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{show.genre}</p>
        </div>
        <div className="flex items-center justify-between border-t border-outline-variant pt-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
              Episodes
            </span>
            <span className="font-data-point text-data-point text-primary">{show.episodes}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
              Last Edited
            </span>
            <span className="font-data-point text-data-point text-on-surface">
              {show.lastEdited}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}