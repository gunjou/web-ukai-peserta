"use client";

import { useEffect, useMemo, useState } from "react";

import CalendarGrid from "@/components/jadwal/calendar-grid";
import CalendarNavigation from "@/components/jadwal/calendar-navigation";
import ScheduleDetailDialog from "@/components/jadwal/schedule-detail-dialog";
import { getSchedules, toSchedule } from "@/services/schedule.service";

import type { Schedule } from "@/types/schedule";

/* =========================================================
 * CALENDAR HELPER
 * ========================================================= */

function generateCalendar(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const totalDays = lastDay.getDate();

  /*
   * JavaScript:
   * Sunday = 0
   * Monday = 1
   *
   * Kalender kita dimulai dari Senin.
   */
  const firstDayIndex = (firstDay.getDay() + 6) % 7;
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  // Cell sebelum tanggal 1
  for (let i = 0; i < firstDayIndex; i++) {
    week.push(null);
  }

  // Tanggal bulan
  for (let day = 1; day <= totalDays; day++) {
    week.push(new Date(year, month, day));

    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  // Sisa cell
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }

    weeks.push(week);
  }

  return weeks;
}

/* =========================================================
 * PAGE
 * ========================================================= */

export default function JadwalKelasPage() {
  /*
   * State bulan yang sedang ditampilkan.
   *
   * Saat API sudah tersedia, ini bisa diganti
   * dengan new Date().
   */
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * State jadwal yang sedang dipilih.
   */
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  /*
   * State untuk membuka / menutup modal detail.
   */
  const [openDetail, setOpenDetail] = useState(false);

  useEffect(() => {
    async function fetchSchedules() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getSchedules(token);
        setSchedules(
          Array.isArray(result.data) ? result.data.map(toSchedule) : []
        );
      } catch (requestError) {
        console.error(requestError);
        setError("Jadwal belum dapat dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /*
   * Generate kalender hanya ketika year/month berubah.
   */
  const calendar = useMemo(() => generateCalendar(year, month), [year, month]);

  /* =====================================================
   * MONTH NAVIGATION
   * ===================================================== */

  function handlePreviousMonth() {
    setCurrentDate(
      (previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1)
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      (previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1)
    );
  }

  /* =====================================================
   * SCHEDULE DETAIL
   * ===================================================== */

  function handleScheduleClick(schedule: Schedule) {
    setSelectedSchedule(schedule);
    setOpenDetail(true);
  }

  function handleCloseDetail() {
    setOpenDetail(false);
    setSelectedSchedule(null);
  }

  /* =====================================================
   * RENDER
   ===================================================== */

  return (
    <div className="flex h-[calc(90vh-64px)] flex-col overflow-hidden">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="shrink-0 border-b bg-background">
        <div
          className="
            flex flex-col gap-4 pb-4
            md:flex-row md:items-center md:justify-between
          "
        >
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jadwal Kelas</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Lihat jadwal pembelajaran dan pertemuan kelas Anda.
            </p>
          </div>

          {/* LEGEND */}
          <div
            className="
              flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground
              sm:justify-end
            "
          >
            {/* ONLINE */}
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-blue" />
              <span>Online</span>
            </div>

            {/* OFFLINE */}
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          flex-1 overflow-y-auto px-1 py-5
          sm:px-2 md:px-4
        "
      >
        <div className="mx-auto max-w-7xl">
          {/* CALENDAR CARD */}
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {/* MONTH NAVIGATION */}
            <div
              className="
                flex items-center justify-center border-b bg-background px-3 py-3
                sm:py-4
              "
            >
              <CalendarNavigation
                month={month}
                year={year}
                onPrevious={handlePreviousMonth}
                onNext={handleNextMonth}
              />
            </div>

            {/* CALENDAR */}
            {loading ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-muted-foreground">
                Memuat jadwal...
              </div>
            ) : error ? (
              <div className="flex min-h-[420px] items-center justify-center px-6 text-center text-sm text-destructive">
                {error}
              </div>
            ) : (
              <CalendarGrid
                year={year}
                month={month}
                calendar={calendar}
                schedules={schedules}
                onScheduleClick={handleScheduleClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          SCHEDULE DETAIL MODAL
      ================================================= */}

      <ScheduleDetailDialog
        open={openDetail}
        onClose={handleCloseDetail}
        schedule={selectedSchedule}
        token={
          typeof window === "undefined"
            ? null
            : localStorage.getItem("access_token")
        }
      />
    </div>
  );
}
