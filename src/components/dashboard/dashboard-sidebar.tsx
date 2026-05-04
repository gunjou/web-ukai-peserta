"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { BookOpen, FileText, LayoutDashboard, PlayCircle } from "lucide-react";
import Image from "next/image";

const menus = [
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

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="
        hidden
        md:flex

        w-[260px]
        flex-col
        border-r
        bg-card

        sticky
        top-0
        h-screen
      "
    >
      {/* Logo */}
      <div className=" flex h-20 items-center border-b px-6">
        <Image
          src="/images/logo_horizontal.svg"
          alt="UKAI Syndrome"
          width={160}
          height={40}
          className="h-14 w-auto"
        />
      </div>

      {/* Menu */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = pathname.startsWith(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex items-center gap-3
                rounded-xl
                px-4 py-3
                text-sm font-medium
                transition-all

                ${
                  active
                    ? `
                      bg-primary
                      text-primary-foreground
                    `
                    : `
                      text-muted-foreground
                      hover:bg-muted
                      hover:text-foreground
                    `
                }
              `}
            >
              <Icon className="h-5 w-5" />

              {menu.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
