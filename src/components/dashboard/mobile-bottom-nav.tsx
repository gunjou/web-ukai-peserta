"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Video,
  ClipboardList,
  BarChart,
  Sparkles,
} from "lucide-react";

import { useUserStore } from "@/stores/user.store";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useUserStore((s) => s.user);
  const hasMentorship = !!user?.mentorships;

  const menus = [
    {
      label: "Materi",
      icon: BookOpen,
      href: "/dashboard/modul-materi",
    },
    {
      label: "Video",
      icon: Video,
      href: "/dashboard/modul-video",
    },

    // 🔥 CONDITIONAL PRIVATE
    ...(hasMentorship
      ? [
          {
            label: "Private",
            icon: Sparkles,
            href: "/dashboard/private-materi-dan-video",
          },
        ]
      : []),

    {
      label: "Tryout",
      icon: ClipboardList,
      href: "/dashboard/tryout",
    },
    {
      label: "Hasil",
      icon: BarChart,
      href: "/dashboard/hasil-tryout",
    },
  ];

  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50

        border-t
        bg-background/95
        backdrop-blur

        flex
        justify-around
        py-2
      "
    >
      {menus.map((menu) => {
        const isActive = pathname.startsWith(menu.href);
        const Icon = menu.icon;

        return (
          <button
            key={menu.href}
            onClick={() => router.push(menu.href)}
            className="
              relative
              flex
              flex-col
              items-center
              justify-center
              text-xs
              gap-1
              flex-1
            "
          >
            {/* ICON */}
            <Icon
              className={`
                w-5 h-5 transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
            />

            {/* LABEL */}
            <span
              className={`
                transition-colors
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
            >
              {menu.label}
            </span>

            {/* 🔥 BADGE PRIVATE */}
            {menu.label === "Private" && (
              <span
                className={`
                  absolute -top-1 right-3 text-[8px] px-1 rounded
                  ${
                    isActive ? "bg-white text-primary" : "bg-primary text-white"
                  }
                `}
              >
                PRO
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
