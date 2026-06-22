"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  AlertTriangle,
  Clock,
  BookOpen,
  CheckCircle,
  ArrowLeft,
  Calculator,
  HelpCircle,
} from "lucide-react";
import { Tryout } from "@/types/tryout";
import { getTryouts } from "@/services/tryout.service";

export default function TryoutDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const tryoutId = Number(params.id);

  const [tryout, setTryout] = useState<Tryout | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedTC, setAgreedTC] = useState(false);
  const [startingAttempt, setStartingAttempt] = useState(false);

  useEffect(() => {
    async function fetchTryout() {
      try {
        if (Number.isNaN(tryoutId)) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const result = await getTryouts(token);

        const found = result.data.find((t: Tryout) => t.id === tryoutId);

        setTryout(found ?? null);
      } catch (error) {
        console.error("Fetch tryout error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTryout();
  }, [tryoutId]);

  async function handleStartTryout() {
    if (!agreedTC || !tryout) return;

    setStartingAttempt(true);

    try {
      router.push(`/tryout/${tryoutId}/attempt`);
    } catch (error) {
      console.error(error);
      setStartingAttempt(false);
    }
  }

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

  if (loading) {
    return <div className="p-6">Memuat detail tryout...</div>;
  }

  if (!tryout) {
    return <div className="p-6">Tryout tidak ditemukan</div>;
  }

  const isDisabled =
    tryout.status === "closed" ||
    tryout.status === "upcoming" ||
    tryout.remaining_attempt === 0;

  const getButtonLabel = () => {
    if (tryout.status === "upcoming") {
      return "Belum Dimulai";
    }

    if (tryout.status === "closed") {
      return "Tryout Ditutup";
    }

    if (tryout.remaining_attempt === 0) {
      return "Percobaan Habis";
    }

    return "Mulai Tryout";
  };

  // ==========================================
  // PERUBAHAN: Teks Panduan Cara Mengerjakan
  // ==========================================
  const requirements = [
    {
      icon: BookOpen,
      title: "Sistem Pilihan Ganda (Multiple Choice)",
      desc: "Pilih salah satu jawaban yang paling tepat. Jawaban Anda akan otomatis tersimpan begitu diklik.",
    },
    {
      icon: AlertTriangle,
      title: "Fitur Centang Ragu-Ragu",
      desc: "Jika belum yakin dengan jawaban Anda, centang opsi 'Ragu-Ragu'. Nomor soal pada peta navigasi akan berubah warna menjadi kuning sebagai penanda.",
    },
    {
      icon: Calculator,
      title: "Fasilitas Alat Bantu Kalkulator",
      desc: "Tersedia tombol pintas kalkulator di pojok kanan atas layar pengerjaan untuk membantu Anda menghitung soal-soal eksak.",
    },
    {
      icon: Clock,
      title: "Durasi Berjalan Terus (Countdown)",
      desc: "Waktu akan dihitung mundur sejak Anda menekan tombol mulai. Sisa waktu pengerjaan akan selalu terlihat di bagian atas halaman.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{tryout.title}</h1>

              <div className="mt-3">
                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {tryout.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:hidden">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Soal</p>
                <p className="mt-1 text-lg font-bold">{tryout.total_soal}</p>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Durasi</p>
                <p className="mt-1 text-lg font-bold">
                  {tryout.duration} menit
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Percobaan</p>
                <p className="mt-1 text-lg font-bold">
                  {tryout.remaining_attempt}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <h2 className="mb-4 font-semibold">Jadwal Tryout</h2>

              <div className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium">Mulai</span>

                  <span className="text-muted-foreground">
                    {formatDate(tryout.access_start_at)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="font-medium">Berakhir</span>

                    <span className="text-muted-foreground">
                      {formatDate(tryout.access_end_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: Panduan Teknis Pengerjaan */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Petunjuk Pengerjaan Tryout
              </h2>

              <div className="space-y-3">
                {requirements.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div key={index} className="rounded-xl border bg-card p-4">
                      <div className="flex gap-4">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                        <div>
                          <p className="font-medium">{item.title}</p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: Syarat & Ketentuan */}
            <div>
              <h2 className="mb-4 text-lg font-semibold">Syarat & Ketentuan</h2>

              <div className="rounded-xl border bg-card p-5">
                <ul className="ml-5 list-disc space-y-2 text-sm text-muted-foreground">
                  <li>
                    Pastikan koneksi internet stabil sebelum menekan tombol
                    mulai.
                  </li>
                  <li>
                    Anda bebas berpindah nomor soal menggunakan panel navigasi
                    yang tersedia.
                  </li>
                  <li>
                    Pastikan Anda menghilangkan centang 'Ragu-Ragu' pada soal
                    sebelum waktu berakhir agar nilai terhitung maksimal.
                  </li>
                  <li>
                    Gunakan kalkulator layar hanya sebagai alat bantu hitung,
                    dilarang membuka tab/browser baru demi integritas ujian.
                  </li>
                  <li>
                    Setelah menekan tombol 'Selesai / Submit', seluruh jawaban
                    akan dikunci dan tidak dapat diubah kembali.
                  </li>
                </ul>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 lg:hidden">
                <input
                  type="checkbox"
                  checked={agreedTC}
                  onChange={(e) => setAgreedTC(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />

                <span className="text-sm">
                  Saya memahami petunjuk pengerjaan dan setuju dengan syarat &
                  ketentuan.
                </span>
              </label>
            </div>

            {isDisabled && (
              <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {tryout.status === "upcoming"
                    ? "Tryout belum dimulai. Silakan tunggu waktu mulai."
                    : tryout.status === "closed"
                    ? "Periode tryout sudah berakhir."
                    : "Anda sudah mencapai jumlah percobaan maksimum."}
                </p>
              </div>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold">Ringkasan Tryout</h3>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <span>Total Soal</span>
                    <span className="font-bold">{tryout.total_soal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Durasi</span>
                    <span className="font-bold">{tryout.duration} menit</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Sisa Percobaan</span>
                    <span className="font-bold">
                      {tryout.remaining_attempt}
                    </span>
                  </div>
                </div>

                <div className="my-6 border-t" />

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={agreedTC}
                    onChange={(e) => setAgreedTC(e.target.checked)}
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm">
                    Saya memahami petunjuk pengerjaan dan setuju dengan syarat &
                    ketentuan.
                  </span>
                </label>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleStartTryout}
                    disabled={isDisabled || !agreedTC || startingAttempt}
                    className="w-full rounded-lg bg-primary py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {startingAttempt ? "Memulai..." : getButtonLabel()}
                  </button>

                  <button
                    onClick={() => router.back()}
                    className="w-full rounded-lg border py-3 font-medium hover:bg-muted"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:hidden">
        <button
          onClick={handleStartTryout}
          disabled={isDisabled || !agreedTC || startingAttempt}
          className="w-full rounded-lg bg-primary py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {startingAttempt ? "Memulai..." : getButtonLabel()}
        </button>
      </div>
    </div>
  );
}
