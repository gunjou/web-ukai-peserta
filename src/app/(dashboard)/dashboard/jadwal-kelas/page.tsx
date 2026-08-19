"use client";

import { useMemo, useState } from "react";

import CalendarGrid from "@/components/jadwal/calendar-grid";
import CalendarNavigation from "@/components/jadwal/calendar-navigation";
import ScheduleDetailDialog from "@/components/jadwal/schedule-detail-dialog";

import type { Schedule } from "@/types/schedule";

/* =========================================================
 * DUMMY DATA
 * ========================================================= */

const scheduleData: Schedule[] = [
  {
    id: 1,
    date: "2026-08-03",
    name: "Pembahasan Modul 1",
    start_time: "08:00",
    end_time: "10:00",
    meeting_type: "online",
    mentor: "dr. Andi Setiawan",
    location: "Google Meet",
  },
  {
    id: 2,
    date: "2026-08-05",
    name: "Diskusi Farmakologi",
    start_time: "13:00",
    end_time: "15:00",
    meeting_type: "offline",
    mentor: "dr. Budi Santoso",
    location: "Ruang Kelas A",
  },
  {
    id: 3,
    date: "2026-08-08",
    name: "Pembahasan Soal Tryout",
    start_time: "09:00",
    end_time: "11:00",
    meeting_type: "online",
    mentor: "dr. Citra Dewi",
    location: "Google Meet",
  },
  {
    id: 4,
    date: "2026-08-12",
    name: "Mentoring Bersama",
    start_time: "15:00",
    end_time: "17:00",
    meeting_type: "offline",
    mentor: "dr. Andi Setiawan",
    location: "Ruang Mentor",
  },
  {
    id: 5,
    date: "2026-08-15",
    name: "Review Materi Mingguan",
    start_time: "08:00",
    end_time: "09:30",
    meeting_type: "online",
    mentor: "dr. Citra Dewi",
    location: "Google Meet",
  },
  {
    id: 6,
    date: "2026-08-18",
    name: "Pembahasan Kasus",
    start_time: "13:00",
    end_time: "14:42",
    meeting_type: "offline",
    mentor: "dr. Budi Santoso",
    location: "Ruang Kelas B",
  },
  {
    id: 7,
    date: "2026-08-19",
    name: "Pembahasan Kasus",
    start_time: "10:00",
    end_time: "12:00",
    meeting_type: "offline",
    mentor: "dr. Budi Santoso",
    location: "Ruang Kelas B",
  },
];

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));

  /*
   * State jadwal yang sedang dipilih.
   */
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  /*
   * State untuk membuka / menutup modal detail.
   */
  const [openDetail, setOpenDetail] = useState(false);

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
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
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
            <CalendarGrid
              year={year}
              month={month}
              calendar={calendar}
              schedules={scheduleData}
              onScheduleClick={handleScheduleClick}
            />
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
      />
    </div>
  );
}
