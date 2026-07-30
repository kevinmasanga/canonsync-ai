// components/layout/Topbar.jsx

"use client";

import { useSidebar } from "./SidebarContext";
import Icon from "../common/Icon";

export default function Topbar({ title }) {
  const { toggleMobile, toggleCollapse, isCollapsed } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-dim/80 px-container-padding py-stack-tight backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobile}
          className="text-primary md:hidden"
          aria-label="Open menu"
        >
          <Icon name="menu" />
        </button>
        <button
          onClick={toggleCollapse}
          className="hidden text-on-surface-variant transition-colors hover:text-primary md:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={isCollapsed ? "menu_open" : "menu"} />
        </button>
        <span className="font-headline-sm text-headline-sm font-bold text-primary">{title}</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-on-surface-variant transition-colors hover:text-primary">
          <Icon name="notifications" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-surface-dim bg-primary" />
        </button>
        <div className="hidden h-8 w-[1px] bg-outline-variant sm:block" />
        <div className="hidden items-center gap-3 sm:flex">
          <span className="font-body-md text-body-md font-semibold">Sarah Jenkins</span>
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-primary/20">
            <Icon name="account_circle" className="text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}