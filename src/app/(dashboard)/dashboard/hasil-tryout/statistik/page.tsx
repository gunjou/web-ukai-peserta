"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/shared/empty-state";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import { getTryouts, getTryoutResults } from "@/services/tryout.service";
import { TryoutResultItem } from "@/types/tryout";
import {
  ArrowLeft,
  Award,
  Target,
  TrendingUp,
  ChartLine,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

type BarFilterMode = "pertama" | "tertinggi";

const BAR_FILTER_OPTIONS: { value: BarFilterMode; label: string }[] = [
  { value: "pertama", label: "Percobaan Pertama" },
  { value: "tertinggi", label: "Nilai Tertinggi" },
];

const RIWAYAT_ITEMS_PER_PAGE = 8;

type AvailableTryout = {
  id: string | number;
  title: string;
};

export default function StatistikTryoutPage() {
  const router = useRouter();
  const [results, setResults] = useState<TryoutResultItem[]>([]);
  const [availableTryouts, setAvailableTryouts] = useState<AvailableTryout[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [barFilterMode, setBarFilterMode] =
    useState<BarFilterMode>("tertinggi");

  useEffect(() => {
    fetchResults();
    fetchAvailableTryouts();
  }, []);

  async function fetchResults() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryoutResults(token);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableTryouts() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryouts(token);
      const formatted = (res.data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
      }));
      setAvailableTryouts(formatted);
    } catch (err) {
      console.error("Gagal mengambil daftar tryout:", err);
    }
  }

  function getScore(item: TryoutResultItem): number {
    return Number((item as any)?.score ?? 0);
  }

  function getDate(item: TryoutResultItem): Date | null {
    const raw = (item as any)?.tanggal;
    return raw ? new Date(raw) : null;
  }

  function getTryoutId(item: TryoutResultItem): string | number | null {
    return (item as any)?.tryout_id ?? null;
  }

  function getAttemptKe(item: TryoutResultItem): number {
    return Number((item as any)?.attempt_ke ?? 1);
  }

  const barChartTryouts = useMemo<AvailableTryout[]>(() => {
    if (availableTryouts.length > 0) return availableTryouts;

    const map = new Map<string, AvailableTryout>();
    results.forEach((item) => {
      const id = getTryoutId(item) ?? item.title;
      if (!map.has(String(id))) {
        map.set(String(id), { id: id as string | number, title: item.title });
      }
    });
    return Array.from(map.values());
  }, [availableTryouts, results]);

  const barChartData = useMemo(() => {
    return barChartTryouts
      .map((t) => {
        const attempts = results.filter((item) => {
          const itemId = getTryoutId(item);
          if (itemId !== null && t.id !== undefined) {
            return String(itemId) === String(t.id);
          }
          return item.title === t.title;
        });

        if (attempts.length === 0) {
          return {
            title: t.title,
            score: 0,
            dikerjakan: false,
            attemptKe: 0,
          };
        }

        const score =
          barFilterMode === "pertama"
            ? attempts.reduce((earliest, curr) =>
                getAttemptKe(curr) < getAttemptKe(earliest) ? curr : earliest
              )
            : attempts.reduce((highest, curr) =>
                getScore(curr) > getScore(highest) ? curr : highest
              );

        return {
          title: t.title,
          score: getScore(score),
          dikerjakan: true,
          attemptKe: getAttemptKe(score),
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [barChartTryouts, results, barFilterMode]);

  const stats = useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) {
      return {
        total: 0,
        belumDikerjakan: availableTryouts.length,
        average: 0,
        highest: 0,
        lowest: 0,
        highestItem: null,
        lowestItem: null,
      };
    }

    const dikerjakanIds = new Set(
      results.map((item) => String(getTryoutId(item) ?? item.title))
    );

    const totalAvailable =
      availableTryouts.length > 0
        ? availableTryouts.length
        : barChartTryouts.length;
    const totalDikerjakanUnik = dikerjakanIds.size;
    const belumDikerjakanCount = Math.max(
      0,
      totalAvailable - totalDikerjakanUnik
    );

    const scores = results.map(getScore);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    const highestItem = results[scores.indexOf(highest)] ?? null;
    const lowestItem = results[scores.indexOf(lowest)] ?? null;

    return {
      total: totalDikerjakanUnik,
      belumDikerjakan: belumDikerjakanCount,
      average,
      highest,
      lowest,
      highestItem,
      lowestItem,
    };
  }, [results, availableTryouts, barChartTryouts]);

  const belumDikerjakanCount = barChartData.filter((d) => !d.dikerjakan).length;

  const totalPages = Math.max(
    1,
    Math.ceil(results.length / RIWAYAT_ITEMS_PER_PAGE)
  );

  const paginatedRiwayat = useMemo(() => {
    const start = (currentPage - 1) * RIWAYAT_ITEMS_PER_PAGE;
    return results.slice(start, start + RIWAYAT_ITEMS_PER_PAGE);
  }, [results, currentPage]);

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
  }

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const maxLength = 12;
    const text = payload.value || "";

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word: string) => {
      if ((currentLine + " " + word).trim().length <= maxLength) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={15}
          textAnchor="middle"
          fill="currentColor"
          className="text-muted-foreground text-[10px]"
        >
          {lines.map((line, index) => (
            <tspan x={0} dy={index === 0 ? 0 : 12} key={index}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  function formatTanggal(date: Date | null) {
    if (!date) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <div className="h-[calc(90vh-64px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between md:pb-4">
          {/* SISI KIRI: Tombol Kembali & Judul */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => router.push("/dashboard/hasil-tryout")}
              className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Kembali
            </button>

            <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
              Analtytic Tryout
            </h1>
          </div>

          {/* SISI KANAN: Tombol Aksi */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center md:gap-3">
            <button
              onClick={() =>
                router.push(
                  "/dashboard/hasil-tryout/statistik/grafik-percobaan"
                )
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <ChartLine className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Analytic Attempt
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <TryoutSkeleton />
        ) : results.length === 0 ? (
          <EmptyState
            title="Belum Ada Statistik"
            description="Statistik akan muncul setelah kamu mengerjakan tryout."
          />
        ) : (
          <div className="space-y-6">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatCard
                icon={<Target className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Total Tryout Dikerjakan"
                value={stats.total.toString()}
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Rata-rata Skor"
                value={stats.average.toFixed(1)}
              />
              <StatCard
                icon={<Award className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Skor Tertinggi"
                value={stats.highest.toString()}
                subtitle={stats.highestItem?.title}
              />
              <StatCard
                icon={<AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Belum Dikerjakan"
                value={stats.belumDikerjakan.toString()}
              />
            </div>

            {/* NILAI PER TRYOUT — BAR CHART */}
            <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              {/* HEADER & FILTER */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold sm:text-base">Tryout</h2>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    {barFilterMode === "tertinggi"
                      ? "Menampilkan nilai tertinggi untuk setiap tryout beserta percobaan ke berapa"
                      : "Menampilkan nilai dari percobaan pertama untuk setiap tryout"}
                  </p>
                </div>

                {/* FILTER PERCOBAAN PERTAMA / NILAI TERTINGGI */}
                <div className="flex w-full items-center gap-1 rounded-2xl border bg-background p-1 shadow-sm sm:w-auto">
                  {BAR_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBarFilterMode(opt.value)}
                      className={`flex-1 rounded-2xl px-2 py-2.5 text-[10px] font-medium transition sm:flex-initial sm:px-3 sm:py-2 sm:text-xs ${
                        barFilterMode === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTENT / CHART */}
              {barChartData.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted-foreground sm:text-sm">
                  Belum ada data tryout untuk ditampilkan.
                </p>
              ) : (
                <>
                  {/* CONTAINER GRAFIK */}
                  <div
                    className="w-full overflow-x-auto pt-2 px-2"
                    style={{ height: 280 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        minWidth: Math.max(barChartData.length * 50, 350),
                        height: "100%",
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barChartData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="title"
                            tick={<CustomXAxisTick />}
                            className="text-muted-foreground"
                            tickMargin={12}
                            interval={0}
                            height={50}
                          />
                          <YAxis
                            tick={{
                              fontSize: 10,
                              fill: "currentColor",
                            }}
                            className="text-muted-foreground"
                            width={32}
                            label={{
                              value: "Skor",
                              angle: -90,
                              position: "insideLeft",
                              style: {
                                fontSize: 10,
                                fill: "currentColor",
                              },
                              className: "text-muted-foreground",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              borderColor: "hsl(var(--border))",
                              color: "hsl(var(--popover-foreground))",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              padding: "6px 10px",
                              fontSize: "12px",
                            }}
                            labelStyle={{
                              color: "hsl(var(--popover-foreground))",
                              fontWeight: "600",
                            }}
                            itemStyle={{
                              color: "hsl(var(--popover-foreground))",
                              fontSize: "12px",
                            }}
                            formatter={(value: any, _name: any, props: any) => {
                              const payload = props?.payload;
                              if (!payload?.dikerjakan) {
                                return ["Belum dikerjakan", "Status"];
                              }
                              if (
                                barFilterMode === "tertinggi" &&
                                payload?.attemptKe > 0
                              ) {
                                return [
                                  `${value} (Percobaan ke-${payload.attemptKe})`,
                                  "Nilai Tertinggi",
                                ];
                              }
                              return [
                                `${value}`,
                                barFilterMode === "pertama"
                                  ? "Percobaan Pertama"
                                  : "Nilai Tertinggi",
                              ];
                            }}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                            {barChartData.map((entry, idx) => (
                              <Cell
                                key={`bar-cell-${idx}`}
                                fill={
                                  entry.dikerjakan
                                    ? "#3b82f6"
                                    : "hsl(var(--muted-foreground) / 0.3)"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* LEGENDA */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-[11px] sm:mt-4 sm:gap-4 sm:pt-4 sm:text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded sm:h-3 sm:w-3"
                        style={{ backgroundColor: "#3b82f6" }}
                      />
                      <span className="font-medium text-foreground">
                        Sudah dikerjakan (
                        {barChartData.filter((d) => d.dikerjakan).length})
                      </span>
                    </span>
                    {belumDikerjakanCount > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded bg-muted-foreground/30 sm:h-3 sm:w-3" />
                        <span className="text-muted-foreground">
                          Belum dikerjakan ({belumDikerjakanCount})
                        </span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RIWAYAT SKOR */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">
                Riwayat Skor per Tryout
              </h2>

              <div className="space-y-3">
                {paginatedRiwayat.map((item) => {
                  const score = getScore(item);
                  const pct = Math.min(
                    (score / (stats.highest || 1)) * 100,
                    100
                  );
                  return (
                    <div key={item.attempt_token} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTanggal(getDate(item))} · Percobaan ke-
                            {(item as any).attempt_ke}
                          </span>
                        </div>
                        <span className="font-semibold text-muted-foreground">
                          {score}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                  <p className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages} ({results.length}{" "}
                    hasil)
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition"
                    >
                      Sebelumnya
                    </button>

                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-sm text-muted-foreground select-none"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`h-9 w-9 rounded-lg text-sm border transition ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  isPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  isPositive?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-card p-3 shadow-sm sm:rounded-2xl sm:p-4">
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground sm:mb-2 sm:gap-2">
          <span className="shrink-0">{icon}</span>
          <span className="line-clamp-1 text-[11px] font-medium sm:text-xs">
            {label}
          </span>
        </div>

        <p
          className={`text-xl font-bold tracking-tight sm:text-2xl ${
            isPositive !== undefined
              ? isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
              : ""
          }`}
        >
          {value}
        </p>
      </div>

      {subtitle && (
        <p className="mt-1 line-clamp-1 text-[10px] text-muted-foreground sm:mt-1.5 sm:text-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
}
