// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import ShowCard from "@/components/dashboard/ShowCard";
import Icon from "@/components/common/Icon";
import { getShows } from "@/lib/apiClient";

export default function DashboardPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getShows({ page: 1, limit: 20 })
      .then((result) => setShows(result.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell title="Good morning, Sarah">
      <div className="flex flex-col gap-stack-loose">
        {/* Header + CTA */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              Production Overview
            </span>
            <h3 className="mt-1 font-headline-md text-headline-md">Project Command Center</h3>
          </div>
          <Link
            href="/shows/new"
            className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-bold text-on-primary shadow-lg shadow-primary-container/20 transition-all hover:brightness-110 active:scale-95"
          >
            <Icon name="add" />
            <span className="font-body-md text-body-md">Create Show</span>
          </Link>
        </div>

        {/* Shows */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h4 className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Current Productions
            </h4>
          </div>

          {loading ? (
            <p className="font-body-md text-body-md text-on-surface-variant">Loading shows…</p>
          ) : error ? (
            <p className="font-body-md text-body-md text-red-500">
              Failed to load shows: {error}
            </p>
          ) : shows.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {shows.map((show) => (
                <ShowCard key={show.show_id} show={show} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}