// app/(tryout)/tryout/[id]/result/page.tsx
"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, RotateCcw, BarChart3 } from "lucide-react";

interface ResultData {
  score: number;
  benar: number;
  salah: number;
  kosong: number;
  ragu_ragu: number;
}

export default function TryoutResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const attemptToken = searchParams.get("token");

  const tryoutId = Number(params.id);

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const data = localStorage.getItem("TRYOUT_RESULT");

      if (!data) {
        setResult({
          score: 0,
          benar: 0,
          salah: 0,
          kosong: 0,
          ragu_ragu: 0,
        });
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(data);

      setResult({
        score: parsed.score ?? 0,
        benar: parsed.benar ?? 0,
        salah: parsed.salah ?? 0,
        kosong: parsed.kosong ?? 0,
        ragu_ragu: parsed.ragu_ragu ?? 0,
      });
    } catch (e) {
      console.error("Invalid result data", e);

      setResult({
        score: 0,
        benar: 0,
        salah: 0,
        kosong: 0,
        ragu_ragu: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("TRYOUT_RESULT:", localStorage.getItem("TRYOUT_RESULT"));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Memuat hasil...</p>
      </div>
    );
  }

  const benar = result?.benar ?? 0;
  const salah = result?.salah ?? 0;
  const kosong = result?.kosong ?? 0;
  const ragu = result?.ragu_ragu ?? 0;

  const total = benar + salah + kosong;

  const benarPct = total ? (benar / total) * 100 : 0;
  const salahPct = total ? (salah / total) * 100 : 0;
  const kosongPct = total ? (kosong / total) * 100 : 0;

  const getScoreClass = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Lulus";
    if (score >= 50) return "Cukup Baik";
    return "Perlu Belajar Lagi";
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* SCORE + STATS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SCORE */}
          <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h1 className="text-3xl font-bold md:text-4xl">Hasil Tryout</h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Berikut hasil pengerjaan tryout Anda
              </p>

              <div className="mt-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />

                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-primary/20 bg-background md:h-48 md:w-48 md:border-[12px]">
                    <div className="text-center">
                      <p
                        className={`text-5xl font-bold md:text-6xl ${getScoreClass(
                          result?.score ?? 0
                        )}`}
                      >
                        {(result?.score ?? 0).toFixed(1)}
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {getScoreLabel(result?.score ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STATISTIK */}
          <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-xl font-semibold">Statistik Jawaban</h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Benar",
                  value: benar,
                  color: "bg-green-500/10 text-green-600 dark:text-green-400",
                },
                {
                  label: "Salah",
                  value: salah,
                  color: "bg-red-500/10 text-red-600 dark:text-red-400",
                },
                {
                  label: "Kosong",
                  value: kosong,
                  color: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
                },
                {
                  label: "Ragu",
                  value: ragu,
                  color:
                    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`flex min-h-[140px] flex-col items-center justify-center rounded-2xl p-5 text-center ${stat.color}`}
                >
                  <p className="text-3xl font-bold md:text-4xl">{stat.value}</p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        {/* PROGRESS */}
        <section className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Distribusi Jawaban</h2>

          <div className="overflow-hidden rounded-full bg-muted">
            <div className="flex h-3 md:h-4">
              <div className="bg-green-500" style={{ width: `${benarPct}%` }} />

              <div className="bg-red-500" style={{ width: `${salahPct}%` }} />

              <div className="bg-gray-400" style={{ width: `${kosongPct}%` }} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground md:text-sm">
            <span>Benar ({benar})</span>
            <span>Salah ({salah})</span>
            <span>Kosong ({kosong})</span>
          </div>
        </section>
        {/* ACTIONS */}
        <section className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:justify-center">
            <button
              onClick={() =>
                router.push(
                  `/dashboard/hasil-tryout/${attemptToken || ""}?score=${
                    result?.score || 0
                  }`
                )
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90 md:w-auto md:min-w-[220px]"
            >
              <BarChart3 className="h-4 w-4" />
              Lihat Pembahasan
            </button>

            <button
              onClick={() => router.push("/dashboard/tryout")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 font-medium transition hover:bg-muted md:w-auto md:min-w-[180px]"
            >
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </button>

            <button
              onClick={() => router.push("/dashboard/modul-materi")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 font-medium transition hover:bg-muted md:w-auto md:min-w-[180px]"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
