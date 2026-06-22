"use client";

import Link from "next/link";
import { TryoutResultItem } from "@/types/tryout";
import { ArrowRight, BarChart3 } from "lucide-react";

interface Props {
  data: TryoutResultItem;
}

export default function ResultCard({ data }: Props) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getScoreClass = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const total = data.benar + data.salah + data.kosong;
  const benarPercent = total > 0 ? (data.benar / total) * 100 : 0;
  const salahPercent = total > 0 ? (data.salah / total) * 100 : 0;
  const kosongPercent = total > 0 ? (data.kosong / total) * 100 : 0;

  return (
    <Link href={`/dashboard/hasil-tryout/${data.attempt_token}`}>
      <div className="space-y-4 rounded-lg border bg-card p-6 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{data.title}</h3>
            <p className="text-sm text-muted-foreground">
              Percobaan ke-{data.attempt_ke} • {formatDate(data.tanggal)}
            </p>
          </div>

          {/* Score */}
          <div className={`text-right ${getScoreClass(data.score)}`}>
            <div className="text-3xl font-bold">{data.score}</div>
            <p className="text-xs font-medium">Skor</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex h-2 gap-0.5 rounded-full overflow-hidden bg-muted">
          <div
            style={{ width: `${benarPercent}%` }}
            className="bg-green-500 transition-all"
          />
          <div
            style={{ width: `${salahPercent}%` }}
            className="bg-red-500 transition-all"
          />
          <div
            style={{ width: `${kosongPercent}%` }}
            className="bg-gray-400 transition-all"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-green-500/10 p-3 text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {data.benar}
            </p>
            <p className="text-xs text-muted-foreground">Benar</p>
          </div>

          <div className="rounded-lg bg-red-500/10 p-3 text-center">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {data.salah}
            </p>
            <p className="text-xs text-muted-foreground">Salah</p>
          </div>

          <div className="rounded-lg bg-gray-500/10 p-3 text-center">
            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
              {data.kosong}
            </p>
            <p className="text-xs text-muted-foreground">Kosong</p>
          </div>

          <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {data.ragu}
            </p>
            <p className="text-xs text-muted-foreground">Ragu</p>
          </div>
        </div>

        {/* View Details */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <BarChart3 className="h-4 w-4" />
            Lihat Pembahasan
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </div>
      </div>
    </Link>
  );
}
