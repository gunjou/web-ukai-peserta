// components/tryout/tryout-item.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  FileQuestionMark,
  Clock,
  RotateCcw,
  Calendar,
  ArrowRight,
} from "lucide-react";
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

  // format singkat: "12 Jul 2026, 08.00"
  const formatShort = (date: string) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(normalizeDate(date));

  const noAttemptLeft = data.remaining_attempt === 0;

  // sudah dikerjakan jika sisa attempt < max attempt (selaras dengan logika di TryoutPage)
  const isDone = data.remaining_attempt < data.max_attempt;

  // warna badge attempt:
  // - merah  : attempt habis (tidak bisa dikerjakan lagi)
  // - hijau  : sudah pernah dikerjakan, masih ada sisa attempt
  // - biru   : belum pernah dikerjakan sama sekali
  const attemptClassName = noAttemptLeft
    ? "bg-red-50 text-red-600"
    : isDone
    ? "bg-emerald-50 text-emerald-600"
    : "bg-blue-50 text-blue-600";

  return (
    <div className="rounded-[8px] border bg-card p-4 transition-all hover:shadow-sm flex flex-col gap-3">
      {/* HEADER: TITLE + STATUS */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold leading-snug break-words">
          {data.title}
        </h2>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* INFO BADGES */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <FileQuestionMark className="h-3.5 w-3.5" />
          {data.total_soal} soal
        </div>

        <div className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {data.duration} menit
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${attemptClassName}`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {data.remaining_attempt}/{data.max_attempt} attempt
        </div>
      </div>

      {/* JADWAL */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {formatShort(data.access_start_at)}
          <ArrowRight className="mx-1.5 inline h-3 w-3" />
          {formatShort(data.access_end_at)}
        </span>
      </div>

      {/* ACTION */}
      {currentStatus === "ongoing" && (
        <button
          disabled={noAttemptLeft}
          onClick={() => router.push(`/tryout/${data.id}`)}
          className={`mt-1 w-full rounded-lg py-2 text-sm font-medium transition-all ${
            noAttemptLeft
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-primary text-white cursor-pointer hover:bg-primary/90"
          }`}
        >
          {noAttemptLeft ? "Selesai" : "Mulai Tryout"}
        </button>
      )}
    </div>
  );
}
