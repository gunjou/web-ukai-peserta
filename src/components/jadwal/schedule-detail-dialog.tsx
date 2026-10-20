"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  NotebookPen,
  StickyNote,
  User,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  checkIn,
  getScheduleDetail,
  toSchedule,
} from "@/services/schedule.service";
import type { Schedule } from "@/types/schedule";
import LateAttendanceDialog from "./late-attendance-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  token: string | null;
}

interface CheckInPayload {
  id_jadwal: number;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
}

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/**
 * Mengambil waktu sekarang sebagai komponen waktu WIB.
 * Digunakan bersama createWibDate agar perbandingan konsisten
 * meskipun zona waktu perangkat pengguna berbeda.
 */
function getWibNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  parts.forEach((part) => {
    if (part.type !== "literal") values[part.type] = part.value;
  });

  return new Date(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
}

/**
 * Membentuk tanggal dan waktu jadwal sebagai komponen WIB.
 */
function createWibDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour = 0, minute = 0, second = 0] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

function isAttendanceTime(schedule: Schedule | null) {
  if (!schedule) return false;

  const now = getWibNow();
  const start = createWibDate(schedule.date, schedule.start_time);
  const end = createWibDate(schedule.date, schedule.end_time);

  return now >= start && now <= end;
}

function isScheduleFinished(schedule: Schedule | null) {
  if (!schedule) return false;

  return (
    getWibNow().getTime() >
    createWibDate(schedule.date, schedule.end_time).getTime()
  );
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Lokasi perangkat tidak tersedia."));
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    const requestLocation = () => {
      attempts += 1;

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          if (
            (error.code === 2 || error.code === 3) &&
            attempts < maxAttempts
          ) {
            setTimeout(requestLocation, error.code === 2 ? 1500 : 1000);
            return;
          }

          if (error.code === 1) {
            reject(
              new Error(
                "Izin lokasi ditolak. Izinkan akses lokasi pada browser.",
              ),
            );
            return;
          }

          reject(
            new Error(
              "Lokasi belum tersedia. Pastikan GPS aktif lalu coba lagi.",
            ),
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    };

    requestLocation();
  });
}

function getVerificationLabel(status?: string | null) {
  switch (status) {
    case "menunggu_verifikasi":
      return "Menunggu verifikasi";
    case "disetujui":
      return "Absensi susulan disetujui";
    case "ditolak":
      return "Absensi susulan ditolak";
    default:
      return null;
  }
}

export default function ScheduleDetailDialog({
  open,
  onClose,
  schedule,
  token,
}: Props) {
  const [detail, setDetail] = useState<Schedule | null>(schedule);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [attendanceAvailable, setAttendanceAvailable] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const [lateDialogOpen, setLateDialogOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [, setClockTick] = useState(0);

  useEffect(() => {
    if (!schedule || !open || !token) {
      setAttendanceAvailable(false);
      setLoadingDetail(false);
      return;
    }

    const currentSchedule = schedule;
    const currentToken = token;

    let cancelled = false;

    setLoadingDetail(true);
    setDetail(currentSchedule);
    setCheckedIn(Boolean(currentSchedule.sudah_absen));
    setAttendanceStatus(currentSchedule.status_kehadiran ?? null);
    setError(null);
    setSuccessMessage(null);

    async function fetchDetail() {
      try {
        const result = await getScheduleDetail(
          currentSchedule.id,
          currentToken,
        );

        if (cancelled) return;

        const mapped = toSchedule(result.data);

        setDetail(mapped);
        setCheckedIn(Boolean(mapped.sudah_absen));
        setAttendanceStatus(mapped.status_kehadiran ?? null);
      } catch (requestError) {
        if (cancelled) return;

        console.error("Gagal mengambil detail jadwal:", requestError);
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    void fetchDetail();

    const updateAttendanceTime = () => {
      setClockTick((tick) => tick + 1);
      setAttendanceAvailable(isAttendanceTime(currentSchedule));
    };

    updateAttendanceTime();

    const interval = setInterval(updateAttendanceTime, 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [schedule, open, token]);

  if (!detail) return null;

  const isOnline = detail.meeting_type === "online";
  const verificationStatus = detail.status_verifikasi;
  const verificationLabel = getVerificationLabel(verificationStatus);
  const isLateSubmission = detail.jenis_absensi === "susulan";
  const isPending =
    isLateSubmission && verificationStatus === "menunggu_verifikasi";
  const isApproved = verificationStatus === "disetujui";
  const isRejected = isLateSubmission && verificationStatus === "ditolak";

  const hasAttended = isLateSubmission
    ? isApproved || detail.kehadiran_disahkan === true
    : Boolean(
        checkedIn ||
        attendanceStatus?.trim().toUpperCase() === "HADIR" ||
        detail.kehadiran_disahkan,
      );

  const hasAttendanceRecord =
    Boolean(detail.sudah_absen) || detail.id_absensi_peserta != null;

  const canSubmitLateAttendance =
    isScheduleFinished(detail) && !hasAttendanceRecord;

  async function handleCheckIn() {
    if (!token || !detail || checkingIn || hasAttendanceRecord) return;

    setCheckingIn(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const online = detail.meeting_type.trim().toLowerCase() === "online";
      const payload: CheckInPayload = { id_jadwal: detail.id };

      if (!online) {
        const position = await getCurrentPosition();

        payload.latitude = position.coords.latitude;
        payload.longitude = position.coords.longitude;
        payload.location_accuracy = position.coords.accuracy;
      }

      await checkIn(payload, token);

      setCheckedIn(true);
      setAttendanceStatus("HADIR");
      setDetail((current) =>
        current
          ? {
              ...current,
              sudah_absen: true,
              status_kehadiran: "HADIR",
              jenis_absensi: "tepat_waktu",
              status_verifikasi: "tidak_perlu_verifikasi",
              kehadiran_disahkan: true,
            }
          : current,
      );

      setAttendanceAvailable(false);
      setSuccessMessage("Kehadiran berhasil dicatat.");
    } catch (requestError) {
      console.error("Gagal check-in:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kehadiran belum dapat ditandai.",
      );
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0 [&>button]:hidden">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogTitle className="pr-8 text-lg font-semibold">
              Detail Pertemuan
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detail jadwal kelas dan informasi kehadiran peserta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div>
              <h2 className="text-base font-semibold">{detail.name}</h2>
              <div
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isOnline ? "bg-accent-blue/10 text-accent-blue" : "bg-muted text-primary"}`}
              >
                {isOnline ? (
                  <Video className="h-3.5 w-3.5" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                {isOnline ? "Pertemuan Online" : "Pertemuan Offline"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {formatDate(detail.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Waktu</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {detail.start_time} - {detail.end_time} WIB
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mentor</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {detail.mentor || "Belum ditentukan"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {isOnline ? (
                    <Video className="h-4 w-4 text-primary" />
                  ) : (
                    <MapPin className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {isOnline ? "Platform" : "Lokasi"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium">
                    {detail.location || "Belum ditentukan"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <NotebookPen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Topik</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm font-medium">
                    {detail.topik || "Belum tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <StickyNote className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Catatan</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm font-medium">
                    {detail.catatan || "Tidak ada catatan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              {loadingDetail ? (
                <div
                  className="flex items-center justify-center gap-2"
                  role="status"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {/* Memuat status kehadiran... */}
                </div>
              ) : hasAttended ? (
                <div className="flex items-center justify-center gap-2 rounded-xl dark:bg-green-100 px-4 py-2.5 text-sm font-semibold dark:text-green-800 transition-colors bg-green-900/40 text-green-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {isLateSubmission ? "Absensi susulan disetujui" : "Hadir"}
                </div>
              ) : isPending ? (
                <div className="flex items-center justify-center gap-2 rounded-xl dark:bg-amber-100 px-4 py-2.5 text-sm font-semibold dark:text-amber-800 transition-colors bg-amber-900/40 text-amber-300">
                  <Clock className="h-4 w-4" />
                  Menunggu verifikasi absensi susulan
                </div>
              ) : isRejected ? (
                <div className="rounded-xl dark:bg-red-100 px-4 py-3 text-sm font-medium dark:text-red-800 transition-colors bg-red-900/40 text-red-300">
                  Pengajuan absensi susulan ditolak. Silakan hubungi admin untuk
                  informasi lebih lanjut.
                </div>
              ) : canSubmitLateAttendance ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setLateDialogOpen(true);
                  }}
                  className="mx-auto flex items-center justify-center gap-2 rounded-xl dark:bg-amber-600 px-5 py-2.5 text-sm font-semibold dark:text-white transition-colors dark:hover:bg-amber-700 bg-amber-500 text-[#1f1712] hover:bg-amber-400"
                >
                  <Clock className="h-4 w-4" />
                  Ajukan Absensi Susulan
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    !attendanceAvailable || checkingIn || hasAttendanceRecord
                  }
                  onClick={handleCheckIn}
                  className="mx-auto flex w-auto items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkingIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Tandai Hadir"
                  )}
                </button>
              )}

              {detail.bukti_kehadiran_url && (
                <a
                  href={detail.bukti_kehadiran_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-sm text-primary underline underline-offset-4"
                >
                  Lihat bukti kehadiran
                </a>
              )}

              {detail.alasan_absensi_susulan && (
                <p className="text-xs text-muted-foreground">
                  Alasan pengajuan: {detail.alasan_absensi_susulan}
                </p>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                {error ||
                  successMessage ||
                  verificationLabel ||
                  (hasAttended
                    ? "Kehadiran Anda sudah tercatat."
                    : attendanceAvailable
                      ? "Anda dapat menandai kehadiran sekarang."
                      : canSubmitLateAttendance
                        ? "Jadwal telah berakhir dan absensi belum tercatat."
                        : "Tombol absensi tersedia sesuai waktu dan status jadwal.")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LateAttendanceDialog
        open={lateDialogOpen}
        onClose={() => setLateDialogOpen(false)}
        scheduleId={detail.id}
        token={token ?? ""}
        onSuccess={() => {
          setDetail((current) =>
            current
              ? {
                  ...current,
                  sudah_absen: true,
                  jenis_absensi: "susulan",
                  status_kehadiran: "HADIR",
                  status_verifikasi: "menunggu_verifikasi",
                  kehadiran_disahkan: false,
                }
              : current,
          );

          setCheckedIn(false);
          setAttendanceStatus(null);

          setSuccessMessage(
            "Pengajuan absensi susulan berhasil dikirim dan menunggu verifikasi.",
          );

          setError(null);
        }}
      />
    </>
  );
}
