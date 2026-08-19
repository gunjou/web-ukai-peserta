"use client";

import { Clock, MapPin, Video } from "lucide-react";

import type { Schedule } from "@/types/schedule";

interface Props {
  schedule: Schedule;
  onClick: (schedule: Schedule) => void;
}

export default function ScheduleItem({ schedule, onClick }: Props) {
  const isOnline = schedule.meeting_type === "online";

  return (
    <>
      {/* MOBILE */}
      <button
        type="button"
        onClick={() => onClick(schedule)}
        className={`
          flex w-full cursor-pointer items-center gap-1 rounded-md border px-1.5 py-1 text-left
          transition hover:opacity-80 sm:hidden
          ${
            isOnline
              ? "border-accent-blue bg-accent-blue/10"
              : "border-primary bg-[#d38c0e]/20"
          }
        `}
        title={schedule.name}
      >
        {isOnline ? (
          <Video className="h-3 w-3 shrink-0 text-accent-blue" />
        ) : (
          <MapPin className="h-3 w-3 shrink-0 text-primary" />
        )}

        <span
          className={`
            truncate text-[8px] font-semibold
            ${isOnline ? "text-accent-blue" : "text-primary"}
          `}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      </button>

      {/* TABLET / DESKTOP */}
      <button
        type="button"
        onClick={() => onClick(schedule)}
        className={`
          hidden w-full cursor-pointer rounded-md border p-1.5 text-left transition hover:shadow-sm
          sm:block sm:rounded-lg sm:p-2
          ${
            isOnline
              ? "border-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20"
              : "border-primary bg-[#d38c0e]/20 hover:bg-[#d38c0e]/30"
          }
        `}
      >
        {/* TITLE */}
        <div className="flex items-start gap-1.5">
          <div
            className={`mt-0.5 shrink-0 ${isOnline ? "text-accent-blue" : "text-primary"}`}
          >
            {isOnline ? (
              <Video className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
          </div>

          <p className="line-clamp-2 text-[9px] font-semibold leading-tight text-foreground sm:text-[11px]">
            {schedule.name}
          </p>
        </div>

        {/* TIME */}
        <div className="mt-1 flex items-center gap-1 text-[8px] text-muted-foreground sm:text-[10px]">
          <Clock className="h-2.5 w-2.5 shrink-0" />

          <span>
            {schedule.start_time} - {schedule.end_time}
          </span>
        </div>

        {/* LOCATION */}
        <div className="mt-0.5 hidden items-center gap-1 text-[9px] text-muted-foreground sm:flex">
          {isOnline ? (
            <>
              <Video className="h-2.5 w-2.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <MapPin className="h-2.5 w-2.5" />
              <span className="truncate">
                {schedule.location || "Lokasi belum tersedia"}
              </span>
            </>
          )}
        </div>
      </button>
    </>
  );
}
