"use client";

import { useState } from "react";
import { Clock, CheckCircle2, Flag, Grid2X2, Calculator } from "lucide-react";
import ScientificCalculator from "@/components/tryout/scientific-calculator";

interface Props {
  current: number;
  total: number;
  remainingTime: number;
  totalDuration: number;
  answeredCount: number;
  raguCount: number;
  onOpenPalette?: () => void;
}

export default function TryoutHeader({
  current,
  total,
  remainingTime,
  totalDuration,
  answeredCount,
  raguCount,
  onOpenPalette,
}: Props) {
  const [calcOpen, setCalcOpen] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const isTimeRunningOut = remainingTime < 300;
  const isCritical = remainingTime < 60;
  const timeProgress =
    totalDuration > 0 ? Math.max(0, (remainingTime / totalDuration) * 100) : 0;

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl relative">
        {/* Mengurangi padding vertikal dari py-4 ke py-2.5 */}
        <div className="px-4 py-2.5 lg:px-6">
          {/* Mengubah flex-col menjadi flex-row agar semua berada di satu baris rata tengah */}
          <div className="flex flex-row items-center justify-between gap-4">
            {/* LEFT SECTION: Judul & Info Soal */}
            <div className="min-w-0 flex items-center gap-4">
              <h1 className="hidden md:block truncate text-base font-bold shrink-0">
                Syndrome Ukai Tryout
              </h1>
              {/* Pembatas vertikal kecil (hanya muncul di desktop bersama judul) */}
              <div className="hidden md:block h-4 w-px bg-border shrink-0" />

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm">
                <span className="font-semibold text-muted-foreground">
                  Soal <span className="text-foreground">{current + 1}</span> /{" "}
                  {total}
                </span>
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {answeredCount}{" "}
                  <span className="hidden sm:inline">Dijawab</span>
                </span>
                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                  <Flag className="h-3.5 w-3.5" />
                  {raguCount} <span className="hidden sm:inline">Ragu</span>
                </span>
              </div>
            </div>

            {/* RIGHT SECTION: Timer & Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Timer (Lebih slim dengan py-1.5 dan text-sm/base) */}
              <div
                className={`
                  flex items-center gap-1.5 rounded-xl px-3 py-1.5
                  font-mono text-sm lg:text-base font-bold shadow-sm shrink-0
                  ${
                    isCritical
                      ? "border border-red-500 bg-red-500/10 text-red-600"
                      : isTimeRunningOut
                      ? "border border-yellow-500 bg-yellow-500/10 text-yellow-600"
                      : "border bg-card"
                  }
                `}
              >
                <Clock className="h-4 w-4" />
                {formatTime(remainingTime)}
              </div>

              {/* Calculator Button */}
              <button
                onClick={() => setCalcOpen((v) => !v)}
                title="Kalkulator Ilmiah"
                className={`
                  flex items-center gap-1.5 rounded-xl border px-3 py-1.5
                  text-xs font-medium shadow-sm transition-all
                  ${
                    calcOpen
                      ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      : "bg-card hover:bg-muted"
                  }
                `}
              >
                <Calculator className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kalkulator</span>
              </button>

              {/* Mobile Palette Button */}
              <button
                onClick={onOpenPalette}
                className="
                  xl:hidden flex items-center gap-1.5 rounded-xl border bg-card
                  px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:bg-muted
                "
              >
                <Grid2X2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Navigasi</span>
              </button>
            </div>
          </div>
        </div>

        {/* ULTRA-SLIM TIME PROGRESS BAR (Menempel absolut di paling bawah border) */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] w-full bg-transparent overflow-hidden">
          <div
            className={`
              h-full transition-all duration-1000
              ${
                isCritical
                  ? "bg-red-500"
                  : isTimeRunningOut
                  ? "bg-yellow-500"
                  : "bg-primary"
              }
            `}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </header>

      {/* Scientific Calculator Modal */}
      {calcOpen && <ScientificCalculator onClose={() => setCalcOpen(false)} />}
    </>
  );
}
