"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardNavbar from "./dashboard-navbar";
import MobileBottomNav from "./mobile-bottom-nav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(() => {
    // SSR safety
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("sidebar-collapsed");

    if (saved !== null) {
      return saved === "true";
    }

    // default responsive
    return window.innerWidth < 1024;
  });

  // ✅ persist
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar collapsed={collapsed} />

      <div className="flex flex-1 flex-col">
        <DashboardNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
