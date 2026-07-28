// components/layout/SidebarContext.jsx

"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  // Desktop: shrinks sidebar to icon-only width, main content margin follows.
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile: sidebar is an overlay drawer, hidden by default.
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed((v) => !v);
  const toggleMobile = () => setIsMobileOpen((v) => !v);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapse, isMobileOpen, toggleMobile, closeMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}