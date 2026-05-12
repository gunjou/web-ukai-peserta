"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BookOpen,
  PlayCircle,
  LayoutDashboard,
  FileText,
  Sparkles,
  Video,
} from "lucide-react";

import Image from "next/image";
import { useUserStore } from "@/stores/user.store";

export default function DashboardSidebar({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);

  const hasMentorship = !!user?.mentorships;

  const mainMenus = [
    {
      name: "Materi",
      href: "/dashboard/modul-materi",
      icon: BookOpen,
    },
    {
      name: "Video",
      href: "/dashboard/modul-video",
      icon: PlayCircle,
    },
    {
      name: "Tryout",
      href: "/dashboard/tryout",
      icon: LayoutDashboard,
    },
    {
      name: "Hasil Tryout",
      href: "/dashboard/hasil-tryout",
      icon: FileText,
    },
  ];

  const privateMenus = hasMentorship
    ? [
        {
          name: "Materi Private",
          href: "/dashboard/private-materi",
          icon: Sparkles,
        },
        {
          name: "Video Private",
          href: "/dashboard/private-video",
          icon: Video,
        },
      ]
    : [];

  function renderMenu(items: typeof mainMenus, isPrivate = false) {
    return items.map((menu) => {
      const Icon = menu.icon;
      const active = pathname.startsWith(menu.href);

      return (
        <Link
          key={menu.href}
          href={menu.href}
          className={`
            relative flex items-center gap-3
            rounded-xl px-3 py-3
            text-sm font-medium transition-all

            ${collapsed ? "justify-center" : ""}

            ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : isPrivate
                  ? "text-primary/80 hover:bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }
          `}
        >
          <Icon className="h-5 w-5 shrink-0" />

          {!collapsed && <span>{menu.name}</span>}

          {/* indicator */}
          {collapsed && active && (
            // <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
            <span className="absolute top-1/2 -translate-y-1/2 " />
          )}

          {/* badge */}
          {!collapsed && isPrivate && (
            <span
              className={`
                ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold
                ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-primary/20 text-primary"
                }
              `}
            >
              PRO
            </span>
          )}
        </Link>
      );
    });
  }

  return (
    <aside
      className={`
        hidden md:flex flex-col border-r bg-card
        transition-all duration-300
        ${collapsed ? "w-[80px]" : "w-[260px]"}
      `}
    >
      {/* HEADER */}
      <div className="flex h-20 items-center justify-center border-b px-4">
        {collapsed ? (
          <Image
            src="/images/logo_syndrome.svg"
            alt="logo"
            width={40}
            height={40}
          />
        ) : (
          <Image
            src="/images/logo_horizontal.svg"
            alt="logo"
            width={160}
            height={40}
            className="h-14 w-auto"
          />
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-4 p-3 overflow-y-auto">
        {!collapsed && (
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">
            Menu Utama
          </p>
        )}

        {renderMenu(mainMenus)}

        {privateMenus.length > 0 && (
          <>
            <div className="border-t my-2" />

            {!collapsed && (
              <p className="px-2 text-xs font-semibold text-primary uppercase">
                Akses Khusus
              </p>
            )}

            {renderMenu(privateMenus, true)}
          </>
        )}
      </div>
    </aside>
  );
}
