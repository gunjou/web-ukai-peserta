// components/tryout/tryout-item.tsx
"use client";

import type { Tryout } from "@/services/tryout.service";

interface Props {
  data: Tryout;
}

export default function TryoutItem({ data }: Props) {
  function getStatusConfig(status: string) {
    switch (status) {
      case "ongoing":
        return {
          label: "Ongoing",
          className: "bg-green-100 text-green-700 border border-green-200",
        };

      case "upcoming":
        return {
          label: "Upcoming",
          className: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        };

      case "ended":
        return {
          label: "Ended",
          className: "bg-red-100 text-red-700 border border-red-200",
        };

      default:
        return {
          label: status,
          className: "bg-muted text-muted-foreground border",
        };
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  }

  const status = getStatusConfig(data.status);

  return (
    <div
      className="
        rounded-2xl
        border
        bg-card
        p-5
        transition-all
        hover:shadow-sm
      "
    >
      <div
        className="
    flex items-start justify-between gap-4
  "
      >
        {/* LEFT */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* TITLE */}
          <div>
            <h2
              className="
          truncate
          text-base
          font-semibold
        "
            >
              {data.title}
            </h2>

            {/* META */}
            <div
              className="
          mt-1
          flex flex-wrap items-center gap-2
          text-xs text-muted-foreground
        "
            >
              <span>{data.total_soal} soal</span>

              <span>•</span>

              <span>{data.duration} menit</span>

              <span>•</span>

              <span>{data.max_attempt}x percobaan</span>
            </div>
          </div>

          {/* DATE */}
          <div
            className="
        flex flex-col gap-1
        text-xs
        font-semibold
      "
          >
            <div className="flex items-center gap-2">
              <span
                className="
            min-w-[55px]
            font-medium
            text-foreground
          "
              >
                Mulai
              </span>

              <span className="text-muted-foreground">
                : {formatDate(data.access_start_at)} WIB
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="
            min-w-[55px]
            font-medium
            text-foreground
          "
              >
                Berakhir
              </span>

              <span className="text-muted-foreground">
                : {formatDate(data.access_end_at)} WIB
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div
          className="
      flex
      shrink-0
      flex-col
      items-end
      gap-3
    "
        >
          {/* STATUS */}
          <span
            className={`
        rounded-full
        px-2.5 py-1
        text-[11px]
        font-semibold
        whitespace-nowrap
        ${status.className}
      `}
          >
            {status.label}
          </span>

          {/* BUTTON */}
          {/* {data.status === "ongoing" && (
            <button
              className="
          rounded-lg
          bg-primary
          px-4 py-2
          text-xs
          font-medium
          text-white
          transition-all
          hover:bg-primary/90
          cursor-pointer
        "
            >
              Mulai
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}
