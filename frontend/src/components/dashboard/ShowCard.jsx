// components/dashboard/ShowCard.jsx
import Link from "next/link";

export default function ShowCard({ show }) {
  const createdDate = show.created_at
    ? new Date(show.created_at).toLocaleDateString()
    : "";

  return (
    <Link
      href={`/shows/${show.show_id}/canon`}
      className="glass-card group block cursor-pointer overflow-hidden rounded-xl"
    >
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h5 className="font-headline-sm text-headline-sm text-on-surface">{show.title}</h5>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant line-clamp-2">
            {show.description || "No description yet."}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-outline-variant pt-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
              Created
            </span>
            <span className="font-data-point text-data-point text-on-surface">
              {createdDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}