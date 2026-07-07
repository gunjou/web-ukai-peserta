"use client";

import { useEffect, useState, useMemo } from "react";
import EmptyState from "@/components/shared/empty-state";
import ResultCard from "@/components/tryout/result-card";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import { getTryoutResults } from "@/services/tryout.service";
import { TryoutResultItem } from "@/types/tryout";

const ITEMS_PER_PAGE = 9;

export default function HasilTryoutPage() {
  const [results, setResults] = useState<TryoutResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchResults();
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

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return results.filter((item) => item.title.toLowerCase().includes(keyword));
  }, [search, results]);

  // reset ke halaman 1 setiap kali pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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

  return (
    <div className="h-[calc(90vh-64px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* LEFT: TITLE */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hasil Tryout</h1>
            <p className="text-sm text-muted-foreground">
              Pantau hasil tryout yang sudah kamu kerjakan.
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
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <TryoutSkeleton />
        ) : filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Belum Ada Hasil Tryout"
              description="Hasil tryout belum tersedia untuk akun Anda."
            />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedData.map((item) => (
                <div
                  key={item.attempt_token}
                  className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition h-full"
                >
                  <ResultCard data={item} />
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
