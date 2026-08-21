"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/shared/empty-state";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import { getTryoutResults } from "@/services/tryout.service";
import { TryoutResultItem } from "@/types/tryout";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

type ChartType = "line" | "bar";

interface AttemptData {
  attemptKe: number;
  score: number;
  tanggal: string;
}

interface TryoutOption {
  id: string | number;
  title: string;
}

export default function GrafikNilaiPercobaan() {
  const router = useRouter();
  const [results, setResults] = useState<TryoutResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTryoutId, setSelectedTryoutId] = useState<
    string | number | null
  >(null);
  const [chartType, setChartType] = useState<ChartType>("line");

  // State untuk Pagination Tabel Detail
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryoutResults(token);
      setResults(res.data || []);

      if ((res.data || []).length > 0) {
        const firstId = getTryoutId(res.data[0]);
        setSelectedTryoutId(firstId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const tryoutOptions = useMemo<TryoutOption[]>(() => {
    const map = new Map<string, TryoutOption>();
    results.forEach((item) => {
      const id = getTryoutId(item) ?? item.title;
      if (!map.has(String(id))) {
        map.set(String(id), {
          id: id as string | number,
          title: item.title,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [results]);

  const selectedTryoutData = useMemo(() => {
    if (!selectedTryoutId) return [];

    return results
      .filter((item) => {
        const itemId = getTryoutId(item);
        if (itemId !== null && selectedTryoutId !== undefined) {
          return String(itemId) === String(selectedTryoutId);
        }
        return item.title === selectedTryoutId;
      })
      .sort((a, b) => getAttemptKe(a) - getAttemptKe(b));
  }, [results, selectedTryoutId]);

  const chartData = useMemo<AttemptData[]>(() => {
    return selectedTryoutData.map((item) => ({
      attemptKe: getAttemptKe(item),
      score: getScore(item),
      tanggal:
        getDate(item)?.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        }) || "-",
    }));
  }, [selectedTryoutData]);

  // Reset pagination ke halaman 1 saat ganti pilihan Tryout
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTryoutId]);

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        totalAttempt: 0,
        rataRata: 0,
        tertinggi: 0,
        terendah: 0,
      };
    }

    const scores = chartData.map((d) => d.score);
    const total = chartData.length;
    const average = scores.reduce((a, b) => a + b, 0) / total;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return {
      totalAttempt: total,
      rataRata: parseFloat(average.toFixed(1)),
      tertinggi: highest,
      terendah: lowest,
    };
  }, [chartData]);

  const selectedTryoutTitle = useMemo(() => {
    const found = tryoutOptions.find(
      (t) => String(t.id) === String(selectedTryoutId)
    );
    return found?.title || "Tryout";
  }, [tryoutOptions, selectedTryoutId]);

  // Data terpaginasi untuk tabel detail
  const totalPages = Math.ceil(chartData.length / itemsPerPage);
  const paginatedTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return chartData.slice(start, start + itemsPerPage);
  }, [chartData, currentPage, itemsPerPage]);

  return (
    <div className="h-[calc(90vh-64px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between md:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => router.push("/dashboard/hasil-tryout/statistik")}
              className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Kembali
            </button>

            <div>
              <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                Analytic Attempt
              </h1>
            </div>
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
            {/* CARD PILIH TRYOUT */}
            <div className="rounded-xl border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-5">
              <label className="mb-2 block text-xs font-semibold sm:mb-3 sm:text-sm">
                Pilih Tryout
              </label>
              <select
                value={String(selectedTryoutId || "")}
                onChange={(e) => setSelectedTryoutId(e.target.value)}
                className="
      w-full rounded-lg border bg-background px-3 py-2
      text-base font-medium transition hover:bg-muted
      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
      sm:px-4 sm:text-sm
    "
              >
                {tryoutOptions.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>
                    {opt.title}
                  </option>
                ))}
              </select>
            </div>

            {chartData.length === 0 ? (
              <EmptyState
                title="Belum Ada Data"
                description="Tryout yang dipilih belum pernah dikerjakan."
              />
            ) : (
              <>
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <StatCard
                    icon={<Target className="h-4 w-4 sm:h-5 sm:w-5" />}
                    label="Total Percobaan"
                    value={stats.totalAttempt.toString()}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
                    label="Rata-rata Nilai"
                    value={stats.rataRata.toString()}
                  />
                  <StatCard
                    icon={<Award className="h-4 w-4 sm:h-5 sm:w-5" />}
                    label="Nilai Tertinggi"
                    value={stats.tertinggi.toString()}
                  />
                </div>

                {/* CHART TYPE SELECTOR */}
                <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-lg bg-muted/50 p-1 sm:w-auto">
                  <button
                    onClick={() => setChartType("line")}
                    className={`
      flex-1 min-w-[120px] rounded-md px-3 py-3 text-xs font-medium transition-all sm:flex-none sm:px-4 sm:py-2 sm:text-sm
      ${
        chartType === "line"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }
    `}
                  >
                    Grafik Garis
                  </button>
                  <button
                    onClick={() => setChartType("bar")}
                    className={`
      flex-1 min-w-[120px] rounded-md px-3 py-3 text-xs font-medium transition-all sm:flex-none sm:px-4 sm:py-2 sm:text-sm
      ${
        chartType === "bar"
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }
    `}
                  >
                    Grafik Batang
                  </button>
                </div>

                {/* CHART CONTAINER */}
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">
                    Progres Nilai: {selectedTryoutTitle}
                  </h2>

                  <div
                    className="w-full overflow-x-auto"
                    style={{ height: 350 }}
                  >
                    <div className="w-full h-full min-w-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === "line" ? (
                          <LineChart
                            data={chartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 25,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="var(--border)"
                            />
                            <XAxis
                              dataKey="attemptKe"
                              tick={{
                                fontSize: 11,
                                fill: "currentColor",
                              }}
                              className="text-muted-foreground"
                              label={{
                                value: "Percobaan ke-",
                                position: "insideBottom",
                                offset: -15,
                                style: {
                                  fontSize: 12,
                                  fill: "currentColor",
                                  fontWeight: 500,
                                },
                              }}
                            />
                            <YAxis
                              tick={{
                                fontSize: 11,
                                fill: "currentColor",
                              }}
                              className="text-muted-foreground"
                              label={{
                                value: "Nilai",
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                                style: {
                                  fontSize: 12,
                                  fill: "currentColor",
                                  fontWeight: 500,
                                },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                padding: "8px 12px",
                                color: "hsl(var(--card-foreground))",
                              }}
                              labelStyle={{
                                color: "hsl(var(--card-foreground))",
                                fontWeight: "600",
                              }}
                              itemStyle={{
                                color: "hsl(var(--primary))",
                                fontSize: "13px",
                              }}
                              formatter={(value: any) => [value, "Nilai"]}
                              labelFormatter={(label) =>
                                `Percobaan ke-${label}`
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#0ea5e9"
                              strokeWidth={3}
                              dot={{
                                fill: "#0ea5e9",
                                r: 5,
                              }}
                              activeDot={{
                                r: 7,
                                fill: "#0284c7",
                              }}
                              name="Nilai"
                            />
                          </LineChart>
                        ) : (
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 25,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="var(--border)"
                            />
                            <XAxis
                              dataKey="attemptKe"
                              tick={{
                                fontSize: 11,
                                fill: "currentColor",
                              }}
                              className="text-muted-foreground"
                              label={{
                                value: "Percobaan ke-",
                                position: "insideBottom",
                                offset: -15,
                                style: {
                                  fontSize: 12,
                                  fill: "currentColor",
                                  fontWeight: 500,
                                },
                              }}
                            />
                            <YAxis
                              tick={{
                                fontSize: 11,
                                fill: "currentColor",
                              }}
                              className="text-muted-foreground"
                              label={{
                                value: "Nilai",
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                                style: {
                                  fontSize: 12,
                                  fill: "currentColor",
                                  fontWeight: 500,
                                },
                              }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                padding: "8px 12px",
                                color: "hsl(var(--card-foreground))",
                              }}
                              labelStyle={{
                                color: "hsl(var(--card-foreground))",
                                fontWeight: "600",
                              }}
                              itemStyle={{
                                color: "hsl(var(--primary))",
                                fontSize: "13px",
                              }}
                              formatter={(value: any) => [value, "Nilai"]}
                              labelFormatter={(label) =>
                                `Percobaan ke-${label}`
                              }
                            />
                            <Bar
                              dataKey="score"
                              fill="#0ea5e9"
                              radius={[6, 6, 0, 0]}
                              name="Nilai"
                            >
                              {chartData.map((entry, idx) => (
                                <Cell
                                  key={`bar-cell-${idx}`}
                                  fill={
                                    entry.score === stats.tertinggi
                                      ? "#10b981"
                                      : "#0ea5e9"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* DETAIL TABEL */}
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">
                    Detail Percobaan
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            Percobaan ke-
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                            Tanggal
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                            Nilai
                          </th>
                          <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTableData.map((data, idx) => {
                          const isHighest = data.score === stats.tertinggi;
                          const isLowest = data.score === stats.terendah;

                          return (
                            <tr
                              key={idx}
                              className="border-b hover:bg-muted/30 transition"
                            >
                              <td className="px-4 py-3 font-medium">
                                {data.attemptKe}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">
                                {data.tanggal}
                              </td>
                              <td className="px-4 py-3 text-right font-semibold">
                                {data.score}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  {isHighest && (
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      Tertinggi
                                    </span>
                                  )}
                                  {isLowest && chartData.length > 1 && (
                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                      Terendah
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* NAVIGASI PAGINATION */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                      {/* Informasi Jumlah Data */}
                      <p className="text-center text-sm text-muted-foreground sm:text-left">
                        Menampilkan{" "}
                        <span className="font-medium text-foreground">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        -{" "}
                        <span className="font-medium text-foreground">
                          {Math.min(
                            currentPage * itemsPerPage,
                            chartData.length
                          )}
                        </span>{" "}
                        dari{" "}
                        <span className="font-medium text-foreground">
                          {chartData.length}
                        </span>{" "}
                        percobaan
                      </p>

                      {/* Navigasi Nomor Halaman */}
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {/* Tombol Sebelumnya */}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Sebelumnya
                        </button>

                        {/* Render Angka Halaman & Ellipsis */}
                        {getPageNumbers().map((page, idx) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="select-none px-2 text-sm text-muted-foreground"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(Number(page))}
                              className={`h-9 w-9 rounded-lg border text-sm font-medium transition ${
                                page === currentPage
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}

                        {/* Tombol Selanjutnya */}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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
  isPositive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p
        className={`text-2xl font-bold tracking-tight ${
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
  );
}
