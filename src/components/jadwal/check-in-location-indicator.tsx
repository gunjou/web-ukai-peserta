"use client";

import {
  LocateFixed,
  Loader2,
  MapPinCheck,
  MapPinOff,
  Navigation,
  Satellite,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import type { CheckInLocation, LocationPhase } from "./use-check-in-location";

interface Tone {
  icon: LucideIcon;
  title: string;
  hint: string;
  // Warna aksen: border, latar, teks, titik denyut.
  card: string;
  text: string;
  dot: string;
  pulse: boolean;
}

const TONES: Record<Exclude<LocationPhase, "idle">, Tone> = {
  searching: {
    icon: Satellite,
    title: "Mencari sinyal GPS",
    hint: "Tetap di halaman ini, lokasi sedang dikunci.",
    card: "border-sky-500/30 bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
    pulse: true,
  },
  checking: {
    icon: Loader2,
    title: "Memeriksa lokasi",
    hint: "Mencocokkan posisi Anda dengan area kelas.",
    card: "border-sky-500/30 bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    dot: "bg-sky-500",
    pulse: true,
  },
  ready: {
    icon: MapPinCheck,
    title: "Siap absen",
    hint: "Lokasi Anda sudah berada di area kelas.",
    card: "border-emerald-500/40 bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    pulse: true,
  },
  outside: {
    icon: Navigation,
    title: "Belum di area kelas",
    hint: "Dekati lokasi mentor, indikator diperbarui otomatis.",
    card: "border-amber-500/40 bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    pulse: false,
  },
  weak: {
    icon: LocateFixed,
    title: "Sinyal GPS lemah",
    hint: "Pindah ke dekat jendela atau area terbuka, tunggu beberapa detik.",
    card: "border-amber-500/40 bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    pulse: false,
  },
  approximate: {
    icon: MapPinOff,
    title: "Lokasi masih perkiraan",
    hint: "Aktifkan lokasi akurat untuk browser ini:",
    card: "border-red-500/40 bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    pulse: false,
  },
  denied: {
    icon: ShieldAlert,
    title: "Izin lokasi ditolak",
    hint: "Izinkan akses lokasi untuk situs ini, lalu buka ulang jadwal:",
    card: "border-red-500/40 bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    pulse: false,
  },
  unavailable: {
    icon: MapPinOff,
    title: "Lokasi tidak terbaca",
    hint: "Aktifkan GPS / layanan lokasi di perangkat Anda.",
    card: "border-red-500/40 bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    pulse: false,
  },
  blocked: {
    icon: ShieldAlert,
    title: "Absensi belum bisa dilakukan",
    hint: "",
    card: "border-border bg-muted/40",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
    pulse: false,
  },
};

const GUIDES: Partial<Record<LocationPhase, string[]>> = {
  approximate: [
    "iPhone: Pengaturan › Privasi › Layanan Lokasi › Safari/Chrome › nyalakan Lokasi Akurat",
    "Android: Pengaturan › Aplikasi › Chrome › Izin › Lokasi › nyalakan Gunakan lokasi akurat",
  ],
  denied: [
    "Ketuk ikon gembok/pengaturan situs di address bar › Lokasi › Izinkan",
    "iPhone: Pengaturan › Privasi › Layanan Lokasi › Safari Websites › Saat Digunakan",
  ],
};

// 4 batang seperti sinyal HP: makin kecil angka akurasi, makin penuh.
function signalLevel(accuracy: number | null) {
  if (accuracy == null) return 0;
  if (accuracy <= 20) return 4;
  if (accuracy <= 50) return 3;
  if (accuracy <= 100) return 2;
  if (accuracy <= 300) return 1;
  return 0;
}

function SignalBars({ accuracy, color }: { accuracy: number | null; color: string }) {
  const level = signalLevel(accuracy);

  return (
    <div className="flex items-end gap-0.5" aria-hidden>
      {[1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className={`w-1 rounded-sm transition-colors duration-500 ${
            bar <= level ? color : "bg-muted-foreground/25"
          }`}
          style={{ height: `${bar * 3 + 3}px` }}
        />
      ))}
    </div>
  );
}

export default function CheckInLocationIndicator({
  location,
}: {
  location: CheckInLocation;
}) {
  if (location.phase === "idle") return null;

  const tone = TONES[location.phase];
  const Icon = tone.icon;
  const guide = GUIDES[location.phase];
  // Pesan server (arah & jarak) lebih berguna daripada hint umum.
  const detail =
    location.phase === "outside" || location.phase === "blocked"
      ? location.message || tone.hint
      : tone.hint;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 transition-colors duration-500 ${tone.card}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/70">
          {tone.pulse && (
            <span
              className={`absolute inset-0 animate-ping rounded-full opacity-30 ${tone.dot}`}
            />
          )}
          <Icon
            className={`relative h-4 w-4 ${tone.text} ${
              location.phase === "checking" ? "animate-spin" : ""
            }`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${tone.text}`}>{tone.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <SignalBars accuracy={location.accuracy} color={tone.dot} />
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
            {location.accuracy != null
              ? `±${Math.round(location.accuracy)} m`
              : "GPS"}
          </span>
        </div>
      </div>

      {guide && (
        <ul className="mt-3 space-y-1.5 border-t border-current/10 pt-3 text-[11px] text-muted-foreground">
          {guide.map((step) => (
            <li key={step} className="flex gap-2">
              <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${tone.dot}`} />
              {step}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
