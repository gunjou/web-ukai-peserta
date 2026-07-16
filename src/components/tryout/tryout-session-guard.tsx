// components/tryout/tryout-session-guard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { checkOngoingTryout, submitAttempt } from "@/services/tryout.service";

const STORAGE_KEY = "ACTIVE_TRYOUT_SESSION";

interface ExpiredNoticeItem {
  idTryout: number;
  attemptToken: string;
  title: string;
  success: boolean;
  score?: number;
}

interface ExpiredNoticeState {
  visible: boolean;
  items: ExpiredNoticeItem[];
}

export default function TryoutSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const isChecking = useRef(false);

  // Notice ditampilkan sekali saat pertama kali guard mendeteksi &
  // men-submit tryout yang sudah expired (bukan aksi user).
  const [notice, setNotice] = useState<ExpiredNoticeState>({
    visible: false,
    items: [],
  });

  useEffect(() => {
    const ignoredRoutes = ["/login", "/register", "/forgot-password"];
    if (ignoredRoutes.includes(pathname)) return;

    if (isChecking.current) return;

    void runGuard();

    async function runGuard() {
      isChecking.current = true;
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        let res;
        try {
          res = await checkOngoingTryout(token);
        } catch (err) {
          // Pakai warn, bukan error, supaya tidak memicu Next.js dev overlay
          // untuk kegagalan yang bisa terjadi secara normal (token expired dsb).
          console.warn("checkOngoingTryout gagal:", err);
          return;
        }

        const ongoing = res?.data?.ongoing ?? [];
        const expired = res?.data?.expired ?? [];

        if (ongoing.length > 0) {
          const activeAttempt = ongoing[0];
          const attemptToken = activeAttempt.attempt_token;
          const attemptPath = `/tryout/${activeAttempt.id_tryout}/attempt`;

          localStorage.setItem("attempt_token", attemptToken);
          localStorage.removeItem(STORAGE_KEY);

          if (pathname !== attemptPath) {
            router.replace(attemptPath);
          }
          return;
        }

        if (expired.length > 0) {
          const results = await Promise.allSettled(
            expired.map((item) => submitAttempt(item.attempt_token, token))
          );

          const noticeItems: ExpiredNoticeItem[] = results.map((r, i) => {
            const item = expired[i];
            // Nama tryout mungkin dikirim dengan key berbeda tergantung
            // response API -- coba beberapa fallback sebelum default generik.
            const title =
              (item as any).judul_tryout ??
              (item as any).nama_tryout ??
              (item as any).title ??
              `Tryout #${item.id_tryout}`;

            if (r.status === "fulfilled") {
              return {
                idTryout: item.id_tryout,
                attemptToken: item.attempt_token,
                title,
                success: true,
                score: r.value?.data?.score,
              };
            }

            console.warn(
              `Gagal submit expired attempt ${item.attempt_token}:`,
              r.reason
            );
            return {
              idTryout: item.id_tryout,
              attemptToken: item.attempt_token,
              title,
              success: false,
            };
          });

          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem("attempt_token");

          setNotice({ visible: true, items: noticeItems });
          return;
        }

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("attempt_token");
      } finally {
        isChecking.current = false;
      }
    }
  }, [pathname, router]);

  function closeNotice() {
    setNotice({ visible: false, items: [] });
  }

  function goToResult(item: ExpiredNoticeItem) {
    setNotice({ visible: false, items: [] });
    router.push(
      `/tryout/${item.idTryout}/result?token=${item.attemptToken}${
        typeof item.score === "number" ? `&score=${item.score}` : ""
      }`
    );
  }

  if (!notice.visible) return null;

  const successItems = notice.items.filter((i) => i.success);
  const failedItems = notice.items.filter((i) => !i.success);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-semibold">
            {notice.items.length > 1
              ? "Tryout Otomatis Dikumpulkan"
              : "Tryout Otomatis Dikumpulkan"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Waktu pengerjaan sudah habis sebelum kamu sempat menutup sesi
            sebelumnya, jadi jawabannya sudah otomatis dikumpulkan sistem.
          </p>
        </div>

        {successItems.length > 0 && (
          <ul className="space-y-2">
            {successItems.map((item) => (
              <li
                key={item.idTryout}
                className="flex items-center justify-between gap-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium text-green-700 dark:text-green-400 truncate">
                    {item.title}
                  </p>
                  {typeof item.score === "number" && (
                    <p className="text-green-700 dark:text-green-400 text-xs">
                      Skor: {item.score}
                    </p>
                  )}
                </div>
                {/* Hanya perlu tombol per-item kalau expired-nya lebih dari satu,
                    kalau cuma satu, tombol utama di bawah sudah cukup. */}
                {successItems.length > 1 && (
                  <button
                    onClick={() => goToResult(item)}
                    className="shrink-0 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Lihat Hasil
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {failedItems.length > 0 && (
          <div className="rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-700 dark:text-yellow-400">
            <p className="font-medium mb-1">
              Gagal mengumpulkan otomatis, coba hubungi admin untuk:
            </p>
            <ul className="list-disc list-inside">
              {failedItems.map((item) => (
                <li key={item.idTryout}>{item.title}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={closeNotice}
            className="flex-1 rounded-xl border py-2.5 font-medium hover:bg-muted"
          >
            Mengerti
          </button>

          {successItems.length > 0 && (
            <button
              onClick={() => goToResult(successItems[0])}
              className="flex-1 rounded-xl bg-primary py-2.5 font-medium text-white hover:bg-primary/90"
            >
              Ke Halaman Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
