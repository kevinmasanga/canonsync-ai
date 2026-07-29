// app/page.jsx

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import StatCard from "@/components/dashboard/StatCard";
import ShowCard from "@/components/dashboard/ShowCard";
import Icon from "@/components/common/Icon";

// TODO: replace with data fetched from GET /api/projects
const SHOWS = [
  {
    id: "neon-horizon",
    title: "Neon Horizon",
    genre: "Sci-Fi Noir • Season 2",
    episodes: "24 Scripts",
    lastEdited: "2 hours ago",
    status: "active",
    statusLabel: "Active",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAroiRip7auq118YV8c7HhQJpqHoQHbOcNZaHAtz6sXnvcqPLSXhXFc_owDY28KQ9fKRpBpsXTdRo9xfSVqFWtDwNSNDZvN-yPN5lzMm6Ic4VnZgX8NRPHG435lSINCNeFT0HlxWWVeWGRJaEJBS2NwzgPpTwOgG__--rIepF0VUOD-UOOwr4-7BwjTQifYw_4R22SLxSkEgJ9twqJbUTT5Egm1D5fHf7jLQdCOqaJdRx-pWjdN3jyx-PcGtbWcjwpy4q_oaVF0KBi",
  },
  {
    id: "silent-pines",
    title: "The Silent Pines",
    genre: "Mystery Drama • Season 1",
    episodes: "10 Scripts",
    lastEdited: "15 mins ago",
    status: "conflicts",
    statusLabel: "Conflicts Found",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlmUkmIQfiUyVOM2J4Yy5SBGxC_MI9Pn__azolm87ipHNpyKi1o2G46teA7LdFkSZyQHy28bU9Li230gAr2ciLo858gVHbGkUHJRVHnHnfenCWhBe1HvzB-UdBmm20dUtoCD8zKnyCvwtjKWkHVfPJoFjW-X7gTbcEw0j2buB_x_5pEgm9x-p0rVE5NIUzLCCsIJtCZqudDXbHUomUOF854j2mMWtI551bHZnKaAAU5AMHMCOFPl3uEolEt9PHl-UTu8dcQuuYJk8x",
  },
  {
    id: "crown-cloak",
    title: "Crown & Cloak",
    genre: "Period Piece • Mini-Series",
    episodes: "6 Scripts",
    lastEdited: "Yesterday",
    status: "reviewing",
    statusLabel: "Reviewing",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqa2-daIlvsGFVwiS0QKQUrVbHjfo1S-RanbbWWkgMfDJXc04yKZJW4MDMhpSA9mQAcblSZ2Tn5rQrPWrUFYLbnPK8ttQzJ59_J_Hq4Yi1wJpblDj6JJHKkxtUjUee2l3SEHMREggJg0zu_Ko-T6AUg8wEF45eRDeACAM_6l_c5poCSvdq0Q026Fb7UX0_dozRgPwUCIqzZzenQJ4aD2KUs5mFWrpB1LQZwIKgRxltWWB5cSZFS3FDqnnt5_I7kKCh3YyZm0z6XVwL",
  },
];

const ACTIVITY = [
  {
    icon: "check",
    title: "Conflict Resolved: ",
    highlight: "Neon Horizon S2 E04",
    detail:
      "Automated sync updated character \u201cKaelen's\u201d eye color inconsistency across 3 scenes.",
    time: "14:22",
  },
  {
    icon: null,
    title: "New Draft Uploaded: ",
    highlight: "The Silent Pines E02 (v4)",
    detail: "Uploaded by Marcus Aurelius. 128 items queued for continuity scan.",
    time: "11:05",
    muted: true,
  },
  {
    icon: "bolt",
    title: "System Alert: Timeline Overlap Detected",
    detail: 'Script 08 "The Coronation" contradicts historical data in Season 1 canon.',
    time: "09:12",
    alert: true,
  },
];

export default function DashboardPage() {
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

        {/* Stats */}
        <section className="grid grid-cols-1 gap-card-gap sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon="database" value="128" label="Total Canon Facts" trend="+12% vs LY" />
          <StatCard icon="warning" filled value="3" label="Active Conflicts" urgent />
          <StatCard icon="history_edu" value="14" label="Writers On-Platform" trend="4 Syncing" />
          <StatCard icon="auto_awesome" value="98%" label="Sync Reliability" trend="Optimized" />
        </section>

        {/* Shows */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h4 className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Current Productions
            </h4>
            <div className="flex gap-4">
              <span className="cursor-pointer font-label-caps text-label-caps text-primary hover:underline">
                View All
              </span>
              <span className="cursor-pointer font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface">
                Archived
              </span>
            </div>
          </div>

          {SHOWS.length === 0 ? (
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
              {SHOWS.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          )}
        </section>

        {/* Activity */}
        <section className="glass-card flex flex-col gap-6 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <h4 className="font-headline-sm text-headline-sm">Continuity Sync History</h4>
            <Icon name="more_horiz" className="cursor-pointer text-on-surface-variant" />
          </div>
          <div className="relative space-y-6 before:absolute before:bottom-2 before:left-3 before:top-2 before:w-[1px] before:bg-outline-variant">
            {ACTIVITY.map((item, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-4 pl-10 ${item.muted ? "opacity-70" : ""}`}
              >
                <span
                  className={`absolute left-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-4 border-surface ${
                    item.alert
                      ? "bg-primary-container"
                      : item.icon
                      ? "bg-primary"
                      : "bg-surface-variant"
                  }`}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      filled
                      size={12}
                      className={item.alert ? "text-on-primary" : "text-black"}
                    />
                  )}
                </span>
                <div>
                  <p className="font-body-md text-body-md text-on-surface">
                    {item.title}
                    {item.highlight && (
                      <span className={`font-bold ${item.alert ? "" : "text-primary"}`}>
                        {item.highlight}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-[12px] text-on-surface-variant">{item.detail}</p>
                </div>
                <span className="ml-auto whitespace-nowrap text-[10px] font-label-caps text-on-surface-variant">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}