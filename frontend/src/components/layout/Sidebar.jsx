// components/layout/Sidebar.jsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import Icon from "../common/Icon";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/shows/current/canon", label: "Canon Store", icon: "storefront" },
  { href: "/shows/current/submit", label: "Submit Scene", icon: "post_add" },
  { href: "/shows/current/conflicts", label: "Conflicts", icon: "warning" },
  { href: "/shows/current/query", label: "Query Engine", icon: "search" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={closeMobile}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-outline-variant bg-surface-container-lowest transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:w-20" : "md:w-64"}
          w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center gap-3 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container">
            <Icon name="auto_stories" className="text-on-primary-container" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary">
                CanonSync AI
              </h1>
              <p className="text-[10px] tracking-widest text-on-surface-variant opacity-70">
                WRITERS&rsquo; ROOM SUITE
              </p>
            </div>
          )}
          <button
            onClick={closeMobile}
            className="ml-auto text-on-surface-variant md:hidden"
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2 transition-colors duration-200 ${
                  active
                    ? "bg-primary-container font-bold text-on-primary-container shadow-lg shadow-primary-container/10"
                    : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                } ${isCollapsed ? "md:justify-center" : ""}`}
              >
                <Icon name={item.icon} filled={active} />
                {!isCollapsed && <span className="font-body-md text-body-md">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant p-4">
          <div className={`flex items-center gap-3 px-2 py-2 text-on-surface-variant ${isCollapsed ? "md:justify-center" : ""}`}>
            <Icon name="account_circle" className="text-primary" />
            {!isCollapsed && (
              <span className="font-body-md text-body-md font-semibold">Sarah Jenkins</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}