"use client";

import type { Schedule } from "@/types/schedule";
import ScheduleItem from "./schedule-item";

interface Props {
  year: number;
  month: number;
  calendar: (Date | null)[][];
  schedules: Schedule[];
  onScheduleClick: (schedule: Schedule) => void;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CalendarGrid({
  year,
  month,
  calendar,
  schedules,
  onScheduleClick,
}: Props) {
  const today = new Date();

  function getScheduleForDate(date: Date | null) {
    if (!date) return [];

    const dateKey = formatDateKey(date);

    return schedules.filter((schedule) => schedule.date === dateKey);
  }

  return (
    <>
      {/* HEADER */}
      <div className="grid grid-cols-7 border-b bg-muted">
        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(
          (day) => (
            <div
              key={day}
              className="
                border-r px-1 py-2.5 text-center text-[10px] font-semibold text-muted-foreground last:border-r-0 sm:px-2 sm:text-xs
              "
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.substring(0, 3)}</span>
            </div>
          ),
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7">
        {calendar.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth =
              date !== null &&
              date.getMonth() === month &&
              date.getFullYear() === year;

            const isToday =
              date !== null &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            const schedulesForDate = getScheduleForDate(date);

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  relative min-h-[90px] border-b border-r p-1.5 transition-colors sm:min-h-[125px] sm:p-2
                  ${
                    !isCurrentMonth
                      ? "bg-muted text-muted-foreground/50"
                      : "bg-background hover:bg-[#d38c0e]/20"
                  }
                  ${dayIndex === 6 ? "border-r-0" : ""}
                `}
              >
                {/* DATE */}
                {date && (
                  <div
                    className={`
                      mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm
                      ${
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : isCurrentMonth
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }
                    `}
                  >
                    {date.getDate()}
                  </div>
                )}

                {/* SCHEDULE */}
                <div className="space-y-1">
                  {schedulesForDate.map((schedule) => (
                    <ScheduleItem
                      key={schedule.id}
                      schedule={schedule}
                      onClick={onScheduleClick}
                    />
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </>
  );
}
