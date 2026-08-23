"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getTryoutArrears } from "@/services/tryout.service";
import { TryoutArrearsResponse } from "@/types/tryout";

const ITEMS_PER_PAGE = 8;

export default function TryoutArrearsPage() {
  const router = useRouter();

  const [data, setData] = useState<TryoutArrearsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchArrears() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await getTryoutArrears(token);
        setData(response.data);
      } catch (fetchError) {
        console.error("Fetch tryout arrears error:", fetchError);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArrears();
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil((data?.tryouts.length ?? 0) / ITEMS_PER_PAGE)
  );
  const paginatedTryouts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data?.tryouts.slice(start, start + ITEMS_PER_PAGE) ?? [];
  }, [currentPage, data]);

  function goToPage(page: number) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    for (let page = 1; page <= totalPages; page += 1) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      ) {
        pages.push(page);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  return (
    <DashboardShell>
      <div className="flex min-h-[calc(90vh-64px)] flex-col overflow-hidden">
        <header className="shrink-0 border-b bg-background/80 backdrop-blur">
          <div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/tryout")}
                className="inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition hover:bg-muted sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                Kembali
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <CircleAlert
                    className="size-6 text-amber-600"
                    aria-hidden="true"
                  />
                  <h1 className="font-heading text-xl font-bold tracking-tight">
                    Tunggakan Tryout
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto py-5">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="space-y-4" aria-label="Memuat data tunggakan">
                <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                <div className="h-96 animate-pulse rounded-2xl bg-muted" />
              </div>
            ) : error || !data ? (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <p className="font-semibold">
                  Data tunggakan belum dapat dimuat.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Silakan coba lagi beberapa saat kemudian.
                </p>
              </div>
            ) : (
              <>
                <section
                  className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                  aria-label="Ringkasan tunggakan"
                >
                  <SummaryCard
                    label="Total tryout"
                    value={data.summary.total_tryout}
                    detail="tryout"
                    icon={
                      <ClipboardList className="size-5" aria-hidden="true" />
                    }
                  />
                  <SummaryCard
                    label="Total soal"
                    value={data.summary.total_soal}
                    detail="seluruh tryout"
                    icon={
                      <ClipboardList className="size-5" aria-hidden="true" />
                    }
                  />
                  <SummaryCard
                    label="Soal dikerjakan"
                    value={data.summary.soal_dikerjakan}
                    detail={`${data.summary.progress_percentage.toFixed(
                      1
                    )}% progress`}
                    icon={
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                    }
                    tone="success"
                  />
                  <SummaryCard
                    label="Tunggakan"
                    value={data.summary.tunggakan}
                    detail="soal tersisa"
                    icon={<CircleAlert className="size-5" aria-hidden="true" />}
                    tone="warning"
                  />
                </section>

                <section
                  className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm"
                  aria-labelledby="tryout-table-title"
                >
                  <div className="border-b px-5 py-4 sm:px-6">
                    <h2
                      id="tryout-table-title"
                      className="font-heading text-lg font-semibold"
                    >
                      Rincian Tryout
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Semua data tryout dari respons API.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3 font-medium sm:px-6">
                            Tryout
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Total soal
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Dikerjakan
                          </th>
                          <th className="px-4 py-3 text-right font-medium">
                            Tunggakan
                          </th>
                          <th className="px-5 py-3 text-right font-medium sm:px-6">
                            Progress
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paginatedTryouts.map((tryout) => (
                          <tr
                            key={tryout.id_tryout}
                            className="hover:bg-muted/30"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <p className="font-medium">{tryout.title}</p>
                            </td>
                            <td className="px-4 py-4 text-right tabular-nums">
                              {tryout.total_soal}
                            </td>
                            <td className="px-4 py-4 text-right tabular-nums">
                              {tryout.soal_dikerjakan}
                            </td>
                            <td
                              className={`px-4 py-4 text-right font-semibold tabular-nums ${
                                tryout.tunggakan > 0
                                  ? "text-amber-700 dark:text-amber-300"
                                  : "text-emerald-700 dark:text-emerald-300"
                              }`}
                            >
                              {tryout.tunggakan}
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              <div className="flex items-center justify-end gap-3">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{
                                      width: `${Math.min(
                                        Math.max(tryout.progress_percentage, 0),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span className="w-14 text-right tabular-nums">
                                  {tryout.progress_percentage.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row sm:px-6">
                    <p className="text-sm text-muted-foreground">
                      Halaman {currentPage} dari {totalPages} (
                      {data.tryouts.length} tryout)
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-sm text-muted-foreground"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="icon-sm"
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClass = {
    neutral: "bg-muted/60 text-muted-foreground",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  }[tone];

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`rounded-lg p-2 ${toneClass}`}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
