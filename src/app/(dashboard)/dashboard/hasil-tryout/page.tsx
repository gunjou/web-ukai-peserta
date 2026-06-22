"use client";

import { useEffect, useState, useMemo } from "react";
import EmptyState from "@/components/shared/empty-state";
import ResultCard from "@/components/tryout/result-card";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import { getTryoutResults } from "@/services/tryout.service";
import { TryoutResultItem } from "@/types/tryout";

export default function HasilTryoutPage() {
  const [results, setResults] = useState<TryoutResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((item) => (
              <div
                key={item.attempt_token}
                className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition h-full"
              >
                <ResultCard data={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
