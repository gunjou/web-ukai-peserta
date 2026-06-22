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
    if (saved !== null) return saved === "true";
    return window.innerWidth < 1024;
  });

  return (
    // 1. Ganti min-h-screen menjadi h-screen overflow-hidden agar base layout membeku
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* SIDEBAR — Sekarang tingginya akan otomatis mengikuti h-screen dari parent */}
      <DashboardSidebar collapsed={collapsed} />

      {/* SISI KANAN (NAVBAR + MAIN CONTENT) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* NAVBAR — Tetap aman di atas karena pembungkusnya overflow-hidden */}
        <DashboardNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* MAIN CONTENT — 2. Tambahkan overflow-y-auto dan h-full / min-h-0
          Di sinilah satu-satunya area scroll halaman dashboard Anda terjadi!
        */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
