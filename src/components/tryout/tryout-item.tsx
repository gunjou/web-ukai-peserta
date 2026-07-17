// components/tryout/tryout-item.tsx
"use client";

import { useRouter } from "next/navigation";
import { Tryout } from "@/types/tryout";

interface Props {
  data: Tryout;
}

export default function TryoutItem({ data }: Props) {
  const router = useRouter();
  const now = new Date();

  const normalizeDate = (date: string) =>
    new Date(date.replace("Z", "") + "+07:00");

  const start = normalizeDate(data.access_start_at);
  const end = normalizeDate(data.access_end_at);

  const getStatusConfig = (status: string) => {
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
  };

  const currentStatus =
    now < start ? "upcoming" : now > end ? "ended" : "ongoing";
  const status = getStatusConfig(currentStatus);

  const formatDate = (date: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneName = new Intl.DateTimeFormat("id-ID", {
      timeZone: timezone,
      timeZoneName: "short",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;

    return `${new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(normalizeDate(date))} ${timezoneName ?? timezone}`;
  };

  return (
    <div className="rounded-[8px] border bg-card p-5 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* LEFT */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* TITLE */}
          <div>
            <h2 className="text-base font-semibold leading-6 break-words">
              {data.title}
            </h2>

            {/* META */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{data.total_soal} soal</span>

              <span>•</span>

              <span>{data.duration} menit</span>

              <span>•</span>

              <span>{data.max_attempt}x max attempt</span>
              <span>{data.remaining_attempt}x sisa attempt</span>
            </div>
          </div>

          {/* DATE */}
          <div className="flex flex-col gap-1 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="min-w-[55px] font-medium text-foreground">
                Mulai
              </span>

              <span className="text-muted-foreground">
                : {formatDate(data.access_start_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="min-w-[55px] font-medium text-foreground">
                Berakhir
              </span>

              <span className="text-muted-foreground">
                : {formatDate(data.access_end_at)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 flex-col items-end gap-3">
          {/* STATUS */}
          <span
            className={`
                whitespace-nowrap
                rounded-full
                px-2.5 py-1
                text-[11px]
                font-semibold
                ${status.className}
              `}
          >
            {status.label}
          </span>

          {/* BUTTON */}
          {currentStatus === "ongoing" && (
            <button
              disabled={data.remaining_attempt === 0}
              onClick={() => router.push(`/tryout/${data.id}`)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                data.remaining_attempt === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                  : "bg-primary text-white cursor-pointer hover:bg-primary/90"
              }`}
            >
              {data.remaining_attempt === 0 ? "Selesai" : "Mulai"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
