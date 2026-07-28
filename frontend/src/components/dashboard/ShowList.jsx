// components/dashboard/ShowList.jsx

import Link from "next/link";
import ShowCard from "./ShowCard";
import Icon from "@/components/common/Icon";

export default function ShowList({ shows }) {
  if (!shows || shows.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-4 rounded-xl p-10 text-center">
        <Icon name="movie" size={40} className="text-on-surface-variant" />
        <div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">No shows yet</h4>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Create your first show to start tracking canon.
          </p>
        </div>
        <Link
          href="/shows/new"
          className="rounded-lg bg-primary-container px-6 py-2.5 font-bold text-on-primary"
        >
          Create Your First Show
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} />
      ))}
    </div>
  );
}