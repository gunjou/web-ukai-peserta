"use client";

import { useEffect, useState, useMemo } from "react";
import EmptyState from "@/components/shared/empty-state";
import TryoutItem from "@/components/tryout/tryout-item";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import { getTryouts } from "@/services/tryout.service";
import { Tryout } from "@/types/tryout";

const ITEMS_PER_PAGE = 9;

type StatusFilter = "all" | "done" | "not_done";

export default function TryoutPage() {
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTryouts();
  }, []);

  async function fetchTryouts() {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryouts(token);
      setTryouts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tryouts.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(keyword);

      // sudah dikerjakan jika sisa attempt < max attempt
      const isDone = item.remaining_attempt < item.max_attempt;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "done" && isDone) ||
        (statusFilter === "not_done" && !isDone);

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter, tryouts]);

  // reset ke halaman 1 setiap kali pencarian/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
  }

  // bikin daftar nomor halaman (dengan ellipsis kalau banyak)
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

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "done", label: "Sudah Dikerjakan" },
    { value: "not_done", label: "Belum Dikerjakan" },
  ];

  return (
    <div className="h-[calc(90vh-64px)] flex flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
          {/* LEFT: TITLE */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tryout</h1>
            <p className="text-sm text-muted-foreground">
              Kerjakan tryout untuk mengukur kemampuan.
            </p>
          </div>

          {/* RIGHT: SEARCH (desktop) */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Cari tryout..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
          w-full
          rounded-xl
          border
          bg-background
          px-4
          py-3
          text-sm
          shadow-sm
          placeholder:text-muted-foreground
          focus:border-primary
          focus:outline-none
          focus:ring-2
          focus:ring-primary/20
        "
            />
          </div>
        </div>

        {/* STATUS FILTER TABS */}
        <div className="flex items-center gap-2 pb-4">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`
                rounded-full border px-4 py-1.5 text-sm transition
                ${
                  statusFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <TryoutSkeleton />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="Belum Ada Tryout"
            description={
              statusFilter === "done"
                ? "Belum ada tryout yang sudah kamu kerjakan."
                : statusFilter === "not_done"
                ? "Semua tryout sudah kamu kerjakan."
                : "Tryout belum tersedia untuk akun Anda."
            }
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedData.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[16px] border bg-card p-4 shadow-sm hover:shadow-md transition h-full"
                >
                  <TryoutItem data={item} />
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages} ({filteredData.length}{" "}
                  hasil)
                </p>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="
                      rounded-lg border px-3 py-2 text-sm
                      disabled:opacity-40 disabled:cursor-not-allowed
                      hover:bg-muted transition
                    "
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
                        className={`
                          h-9 w-9 rounded-lg text-sm border transition
                          ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted"
                          }
                        `}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="
                      rounded-lg border px-3 py-2 text-sm
                      disabled:opacity-40 disabled:cursor-not-allowed
                      hover:bg-muted transition
                    "
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
