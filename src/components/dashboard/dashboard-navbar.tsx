// components/dashboard/dashboard-navbar.tsx
"use client";

import { Bell } from "lucide-react";
import ThemeToggle from "../shared/theme-toggle";
import Image from "next/image";
import UserMenu from "../user/user-menu";

export default function DashboardNavbar() {
  return (
    <header
      className="
        sticky top-0 z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        bg-background/80
        px-4
        backdrop-blur
        md:px-6
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* 🔥 LOGO MOBILE ONLY */}
        <div className="md:hidden">
          <Image
            src="/images/logo_horizontal.svg"
            alt="UKAI Syndrome"
            width={120}
            height={32}
            className="h-12 w-auto"
          />
        </div>

        {/* Desktop title / class */}
        {/* <div className="hidden md:block">
          <p className="font-semibold">Nama Kelas</p>
        </div> */}
      </div>

      {/* RIGHT */}
      {/* Actions */}
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        {/* Notification */}
        <button
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            bg-card
            transition-all
            hover:bg-muted
          "
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Darkmode */}
        <ThemeToggle />

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
