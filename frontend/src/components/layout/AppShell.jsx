// components/layout/AppShell.jsx

"use client";

import { SidebarProvider, useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShellInner({ title, children }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface-dim">
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <Topbar title={title} />
        <main className="p-container-padding">{children}</main>
      </div>
    </div>
  );
}

export default function AppShell({ title, children }) {
  return (
    <SidebarProvider>
      <AppShellInner title={title}>{children}</AppShellInner>
    </SidebarProvider>
  );
}