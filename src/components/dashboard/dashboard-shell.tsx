// components/dashboard/dashboard-shell.tsx
"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardNavbar from "./dashboard-navbar";
import MobileBottomNav from "./mobile-bottom-nav";
import { useUserStore } from "@/stores/user.store";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    const saved = localStorage.getItem("sidebar-collapsed");

    if (saved !== null) {
      return saved === "true";
    }

    return window.innerWidth < 1024;
  });

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
