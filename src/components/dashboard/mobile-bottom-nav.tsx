"use client";

import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Video, ClipboardList, BarChart } from "lucide-react";

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

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

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
              flex
              flex-col
              items-center
              justify-center
              text-xs
              gap-1
            "
          >
            <Icon
              className={`
                w-5 h-5
                ${isActive ? "text-primary" : "text-muted-foreground"}
              `}
            />
            <span
              className={isActive ? "text-primary" : "text-muted-foreground"}
            >
              {menu.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
