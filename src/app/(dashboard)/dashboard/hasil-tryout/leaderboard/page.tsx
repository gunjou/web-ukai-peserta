//app/(dashboard)/dashboard/hasil-tryout/leaderboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Medal,
  Clock,
  ChevronDown,
} from "lucide-react";

import EmptyState from "@/components/shared/empty-state";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

import {
  getTryouts,
  getTryoutLeaderboardClass,
} from "@/services/tryout.service";
import { Tryout, LeaderboardData, LeaderboardItem } from "@/types/tryout";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

function rankBadgeClass(rank: number) {
  if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (rank === 2) return "bg-gray-100 text-gray-700 border-gray-300";
  if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-muted text-muted-foreground border-transparent";
}

export default function LeaderboardClassPage() {
  const router = useRouter();

  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loadingTryouts, setLoadingTryouts] = useState(true);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTryouts();
  }, []);

  async function fetchTryouts() {
    try {
      setLoadingTryouts(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryouts(token);
      const list = res.data || [];
      setTryouts(list);

      // otomatis pilih tryout pertama kalau ada
      if (list.length > 0) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTryouts(false);
    }
  }

  useEffect(() => {
    if (selectedId !== null) fetchLeaderboard(selectedId);
  }, [selectedId]);

  async function fetchLeaderboard(tryoutId: number) {
    try {
      setLoadingLeaderboard(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await getTryoutLeaderboardClass(tryoutId, token);
      setData(res.data || null);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoadingLeaderboard(false);
    }
  }

  const filteredLeaderboard: LeaderboardItem[] = useMemo(() => {
    if (!data) return [];
    const keyword = search.toLowerCase().trim();
    if (!keyword) return data.leaderboard;
    return data.leaderboard.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.class.toLowerCase().includes(keyword)
    );
  }, [search, data]);

  const selectedTryout = tryouts.find((t) => t.id === selectedId) || null;

  return (
    <div className="h-[calc(90vh-64px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 border-b bg-background/80 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4">
          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push("/dashboard/hasil-tryout")}
              className="
          inline-flex h-9 w-9 items-center justify-center
          rounded-xl border hover:bg-muted transition
        "
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold truncate">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Leaderboard
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-1 justify-end items-center gap-3 min-w-[300px]">
            {/* Dropdown */}
            <div className="relative w-72">
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                disabled={loadingTryouts || tryouts.length === 0}
                className="
            w-full appearance-none rounded-xl border bg-background
            px-4 py-2.5 pr-10 text-sm shadow-sm
            focus:border-primary
            focus:outline-none
            focus:ring-2
            focus:ring-primary/20
          "
              >
                {loadingTryouts && <option>Memuat daftar tryout...</option>}

                {!loadingTryouts && tryouts.length === 0 && (
                  <option>Tidak ada tryout tersedia</option>
                )}

                {tryouts.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>

              {/* <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Cari nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!data}
              className="
          w-72 rounded-xl border bg-background
          px-4 py-2.5 text-sm shadow-sm
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
      <div className="flex-1 overflow-y-auto px-1 py-5">
        {loadingTryouts || loadingLeaderboard ? (
          <TryoutSkeleton />
        ) : tryouts.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Belum Ada Tryout"
              description="Belum ada tryout yang tersedia untuk ditampilkan leaderboard-nya."
            />
          </div>
        ) : !data || data.leaderboard.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Belum Ada Data Leaderboard"
              description="Leaderboard akan muncul setelah ada peserta yang menyelesaikan tryout ini."
            />
          </div>
        ) : (
          <>
            {selectedTryout && (
              <p className="mb-4 text-sm text-muted-foreground">
                Menampilkan leaderboard untuk{" "}
                <span className="font-medium text-foreground">
                  {selectedTryout.title}
                </span>
              </p>
            )}

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <SummaryCard
                icon={<Users className="h-5 w-5" />}
                label="Total Peserta"
                value={data.summary.total_participants.toString()}
              />
              <SummaryCard
                icon={<Target className="h-5 w-5" />}
                label="Rata-rata Skor"
                value={data.summary.average_score.toString()}
              />
              <SummaryCard
                icon={<TrendingUp className="h-5 w-5" />}
                label="Skor Tertinggi"
                value={data.summary.highest_score.toString()}
              />
              <SummaryCard
                icon={<Medal className="h-5 w-5" />}
                label="Peringkat Saya"
                value={`#${data.summary.my_rank}`}
                highlight
              />
            </div>

            {/* MY SCORE BANNER */}
            <div
              className="
                mb-6 flex flex-col gap-2 rounded-2xl border
                bg-primary/5 px-5 py-4
                sm:flex-row sm:items-center sm:justify-between
              "
            >
              <p className="text-sm text-muted-foreground">
                Skor kamu pada tryout ini
              </p>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary">
                  {data.summary.my_score}
                </span>
                <span
                  className="
                    rounded-full border bg-background
                    px-3 py-1 text-xs font-medium
                  "
                >
                  Peringkat #{data.summary.my_rank}
                </span>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium">Peringkat</th>
                    <th className="px-4 py-3 font-medium">Nama</th>
                    <th className="px-4 py-3 font-medium">Kelas</th>
                    <th className="px-4 py-3 font-medium text-right">Skor</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Attempt
                    </th>
                    <th className="px-4 py-3 font-medium text-right">Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((item) => (
                    <tr
                      key={item.user_id}
                      className="border-b last:border-0 hover:bg-muted/30 transition"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`
                            inline-flex h-7 w-7 items-center justify-center
                            rounded-full border text-xs font-semibold
                            ${rankBadgeClass(item.rank)}
                          `}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.class}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {item.score}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {item.attempt}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(item.duration)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLeaderboard.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Tidak ada peserta yang cocok dengan pencarian.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl border p-4 shadow-sm
        ${highlight ? "bg-primary/5 border-primary/30" : "bg-card"}
      `}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
        {icon}
        {label}
      </div>
      <p
        className={`text-xl font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
