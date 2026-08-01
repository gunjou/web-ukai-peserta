"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import MateriList from "@/components/materi/materi-list";

import { getMateriByModul, Materi } from "@/services/materi.service";
import { getAccessToken } from "@/lib/auth";

const ITEMS_PER_PAGE_OPTIONS = [4, 8, 12, 24];
const DEFAULT_ITEMS_PER_PAGE = 8;

export default function ModulMateriDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modulId = params.id as string;

  const [materi, setMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  useEffect(() => {
    fetchMateri();
  }, [modulId]);

  async function fetchMateri() {
    try {
      const token = getAccessToken();
      if (!token) return;

      const result = await getMateriByModul(modulId, "document", token);
      setMateri(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!Array.isArray(materi)) return [];

    return materi.filter((item) =>
      (item?.title ?? "").toLowerCase().includes(keyword),
    );
  }, [search, materi]);

  // reset ke halaman 1 setiap kali pencarian atau jumlah item per halaman berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

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
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
          {/* LEFT: BACK BUTTON + TITLE */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Kembali"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                bg-background
                shadow-sm
                hover:bg-muted
                focus:outline-none
                focus:ring-2
                focus:ring-primary/20
                transition
              "
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Materi Modul
              </h1>
              <p className="text-sm text-muted-foreground">
                Daftar materi tersedia pada modul ini.
              </p>
            </div>
          </div>

          {/* RIGHT: SEARCH */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Cari materi..."
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

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[180px] animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="Belum Ada Materi"
            description="Materi untuk modul ini belum tersedia."
          />
        ) : (
          <>
            <MateriList materi={paginatedData} />

            {/* PAGINATION */}
            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages} ({filteredData.length}{" "}
                  hasil)
                </p>

                {/* ITEMS PER PAGE */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="itemsPerPage"
                    className="text-sm text-muted-foreground"
                  >
                    Tampilkan
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="
                      rounded-lg
                      border
                      bg-background
                      px-2
                      py-1.5
                      text-sm
                      shadow-sm
                      focus:border-primary
                      focus:outline-none
                      focus:ring-2
                      focus:ring-primary/20
                    "
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground">
                    / halaman
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
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
                    ),
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
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
