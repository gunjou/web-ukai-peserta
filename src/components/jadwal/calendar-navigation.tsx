"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  month: number;
  year: number;
  onPrevious: () => void;
  onNext: () => void;
}

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function CalendarNavigation({
  month,
  year,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Bulan sebelumnya"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <h2 className="min-w-[150px] text-center text-lg font-bold tracking-tight sm:min-w-[190px] sm:text-xl">
        {monthNames[month]} {year}
      </h2>

      <button
        type="button"
        onClick={onNext}
        aria-label="Bulan berikutnya"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
