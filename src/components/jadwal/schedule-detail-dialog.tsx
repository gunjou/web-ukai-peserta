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

import type { Schedule } from "@/types/schedule";
import {
  checkIn,
  getScheduleDetail,
  toSchedule,
} from "@/services/schedule.service";

interface CheckInPayload {
  id_jadwal: number;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  token: string | null;
}

// function formatDate(date: string) {
//   const [year, month, day] = date.split("-").map(Number);

//   return new Intl.DateTimeFormat("id-ID", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     timeZone: "Asia/Jakarta",
//   }).format(new Date(year, month - 1, day));
// }

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatter.format(new Date(Date.UTC(year, month - 1, day)));
}

/* =========================================================
 * WIB TIME
 * ========================================================= */

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
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
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

function createWibDate(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);

  const [hour = 0, minute = 0, second = 0] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

/* =========================================================
 * CHECK ATTENDANCE TIME
 * ========================================================= */

function isAttendanceTime(schedule: Schedule | null) {
  if (!schedule) return false;

  const now = getWibNow();
  const start = createWibDate(schedule.date, schedule.start_time);
  const end = createWibDate(schedule.date, schedule.end_time);

  return now >= start && now <= end;
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
          console.error(`LOCATION ERROR - attempt ${attempts}:`, error);

          /*
           * kCLErrorLocationUnknown biasanya bersifat
           * sementara. Coba lagi beberapa kali.
           *
           * GeolocationPositionError code:
           * 1 = PERMISSION_DENIED
           * 2 = POSITION_UNAVAILABLE
           * 3 = TIMEOUT
           */

          if (error.code === 2 && attempts < maxAttempts) {
            setTimeout(requestLocation, 1500);
            return;
          }

          if (error.code === 3 && attempts < maxAttempts) {
            setTimeout(requestLocation, 1000);
            return;
          }

          if (error.code === 1) {
            reject(
              new Error(
                "Izin lokasi ditolak. Silakan izinkan akses lokasi pada browser.",
              ),
            );
            return;
          }

          reject(
            new Error(
              "Lokasi perangkat belum tersedia. Pastikan GPS/lokasi aktif lalu coba lagi.",
            ),
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    };

    requestLocation();
  });
}

export default function ScheduleDetailDialog({
  open,
  onClose,
  schedule,
  token,
}: Props) {
  const [attendanceAvailable, setAttendanceAvailable] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [detail, setDetail] = useState<Schedule | null>(schedule);
  const [error, setError] = useState<string | null>(null);

  /* =========================================================
   * GET SCHEDULE DETAIL
   * ========================================================= */

  useEffect(() => {
    if (!schedule || !open || !token) {
      setAttendanceAvailable(false);
      return;
    }

    const activeSchedule = schedule;
    const activeToken = token;

    setDetail(activeSchedule);
    setCheckedIn(false);
    setAttendanceStatus(null);
    setError(null);

    async function fetchDetail() {
      try {
        const result = await getScheduleDetail(activeSchedule.id, activeToken);

        const scheduleDetail = toSchedule(result.data);

        setDetail(scheduleDetail);

        /*
         * Status absensi sekarang langsung berasal
         * dari endpoint detail jadwal.
         */
        setCheckedIn(Boolean(result.data.sudah_absen));
        setAttendanceStatus(result.data.status_kehadiran);
      } catch (requestError) {
        console.error(requestError);
      }
    }

    fetchDetail();

    function updateAttendanceStatus() {
      setAttendanceAvailable(isAttendanceTime(activeSchedule));
    }

    updateAttendanceStatus();

    /*
     * Update setiap detik supaya tombol otomatis
     * aktif ketika waktu mulai tercapai dan
     * kembali disabled ketika waktu selesai.
     */
    const interval = setInterval(updateAttendanceStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [schedule, open, token]);

  if (!detail) return null;

  const isOnline = detail.meeting_type === "online";

  /*
   * Peserta dianggap sudah hadir apabila:
   *
   * 1. sudah_absen dari endpoint = true
   * 2. atau status_kehadiran = HADIR
   *
   * checkedIn digunakan untuk update UI secara langsung
   * setelah proses check-in berhasil.
   */
  const hasAttended =
    checkedIn || attendanceStatus?.trim().toUpperCase() === "HADIR";

  async function handleCheckIn() {
    if (!token || !detail || checkingIn || hasAttended) return;

    setCheckingIn(true);
    setError(null);

    console.log("Attempting to check in for schedule:", detail);

    try {
      const isOnline = detail.meeting_type?.trim().toLowerCase() === "online";

      const payload: CheckInPayload = {
        id_jadwal: detail.id,
      };

      /*
       * OFFLINE
       * Wajib mengambil lokasi.
       */
      if (!isOnline) {
        const position = await getCurrentPosition();

        payload.latitude = position.coords.latitude;
        payload.longitude = position.coords.longitude;
        payload.location_accuracy = position.coords.accuracy;
      }

      console.log("CHECK-IN PAYLOAD:", payload);

      await checkIn(payload, token);

      setCheckedIn(true);
      setAttendanceStatus("HADIR");
      setAttendanceAvailable(false);
    } catch (requestError) {
      console.error("CHECK-IN ERROR:", requestError);

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0 [&>button]:hidden">
        {/* HEADER */}
        <DialogHeader className="border-b bg-muted/30 px-6 py-5">
          {/* CUSTOM CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center
              rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground
            "
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

        {/* CONTENT */}
        <div className="space-y-5 px-6 py-5">
          {/* TITLE */}
          <div>
            <h2 className="text-base font-semibold">{detail.name}</h2>

            <div
              className={`
                mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium
                ${
                  isOnline
                    ? "bg-accent-blue/10 text-accent-blue"
                    : "bg-muted text-primary"
                }
              `}
            >
              {isOnline ? (
                <Video className="h-3.5 w-3.5" />
              ) : (
                <MapPin className="h-3.5 w-3.5" />
              )}

              {isOnline ? "Pertemuan Online" : "Pertemuan Offline"}
            </div>
          </div>

          {/* DETAILS */}
          <div className="space-y-3">
            {/* DATE */}
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

            {/* TIME */}
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

            {/* MENTOR */}
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

            {/* LOCATION */}
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

            {/* TOPIC */}
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

            {/* NOTES */}
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

          {/* ATTENDANCE */}
          <div className="border-t pt-4">
            {hasAttended ? (
              <div className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold dark:text-green-700 dark:bg-green-50 bg-green-950/30 text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Hadir
              </div>
            ) : (
              <button
                type="button"
                disabled={!attendanceAvailable || checkingIn}
                onClick={handleCheckIn}
                className="
                  mx-auto block w-auto rounded-xl bg-primary px-5 py-2
                  text-sm font-semibold text-primary-foreground transition hover:opacity-90
                  disabled:cursor-not-allowed disabled:opacity-40
                "
              >
                {checkingIn ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Tandai Hadir"
                )}
              </button>
            )}

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {error ||
                (hasAttended
                  ? "Kehadiran Anda sudah tercatat."
                  : attendanceStatus
                    ? `Status kehadiran: ${attendanceStatus}`
                    : attendanceAvailable
                      ? "Anda dapat menandai kehadiran sekarang."
                      : "Tombol akan aktif sesuai waktu pertemuan.")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
