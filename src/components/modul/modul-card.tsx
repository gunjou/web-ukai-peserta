"use client";

import Link from "next/link";

import { Modul } from "@/services/modul.service";
import { BookText } from "lucide-react";

interface Props {
  modul: Modul;

  href: string;
}

export default function ModulCard({ modul, href }: Props) {
  const progressStatus = modul.progress
    ? modul.progress.materi_dibuka === 0
      ? {
          label: "Belum dibuka",
          className: "bg-muted text-muted-foreground",
        }
      : modul.progress.materi_dibuka >= modul.progress.total_materi
      ? {
          label: "Selesai",
          className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        }
      : {
          label: "Progres",
          className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
        }
    : null;

  return (
    <Link
      href={href}
      className="
        group
        rounded-2xl
        border
        bg-card
        p-5
        transition-all
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-lg
      "
    >
      {/* Icon */}
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >
        <BookText className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3
        className="
          line-clamp-2
          text-base
          font-semibold
          transition-colors
          group-hover:text-primary
        "
      >
        {modul.title}
      </h3>

      {modul.progress && (
        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span
            className={`rounded-full px-2.5 py-1 font-medium ${progressStatus?.className}`}
          >
            {progressStatus?.label}
          </span>
          <span className="text-muted-foreground">
            {modul.progress.materi_dibuka}/{modul.progress.total_materi} materi
          </span>
        </div>
      )}
    </Link>
  );
}
