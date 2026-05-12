"use client";

import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import ThemeToggle from "../shared/theme-toggle";
import Image from "next/image";
import UserMenu from "../user/user-menu";

export default function DashboardNavbar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* MOBILE LOGO */}
        <div className="md:hidden">
          <Image
            src="/images/logo_horizontal.svg"
            alt="UKAI"
            width={120}
            height={32}
            className="h-12 w-auto"
          />
        </div>

        {/* DESKTOP TOGGLE */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border bg-card hover:bg-muted transition"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border bg-card hover:bg-muted transition">
          <Bell className="h-5 w-5" />
        </button>

        <ThemeToggle />
        <button className="">
          <UserMenu />
        </button>
      </div>
    </header>
  );
}
