"use client";

import {
  CalendarDays,
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
  getAttendanceStatus,
  getScheduleDetail,
  toSchedule,
} from "@/services/schedule.service";

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  token: string | null;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/* =========================================================
 * CHECK ATTENDANCE TIME
 * ========================================================= */

function isAttendanceTime(schedule: Schedule | null) {
  if (!schedule) return false;

  const now = new Date();

  /*
   * Karena schedule.date berasal dari format:
   *
   * YYYY-MM-DD
   *
   * dan start_time / end_time:
   *
   * HH:mm
   *
   * kita gabungkan menjadi waktu lokal browser.
   *
   * Browser peserta diasumsikan menggunakan WIB.
   */

  const start = new Date(`${schedule.date}T${schedule.start_time}:00`);
  const end = new Date(`${schedule.date}T${schedule.end_time}:00`);

  return now >= start && now <= end;
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
   * UPDATE ATTENDANCE STATUS
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

    async function fetchAttendance() {
      try {
        const [detailResult, attendanceResult] = await Promise.all([
          getScheduleDetail(activeSchedule.id, activeToken),
          getAttendanceStatus(activeSchedule.id, activeToken),
        ]);
        setDetail(toSchedule(detailResult.data));
        setCheckedIn(attendanceResult.data.sudah_absen);
        setAttendanceStatus(attendanceResult.data.status_kehadiran);
      } catch (requestError) {
        console.error(requestError);
      }
    }

    fetchAttendance();

    function updateAttendanceStatus() {
      setAttendanceAvailable(isAttendanceTime(schedule));
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
  const hasAttended =
    checkedIn || attendanceStatus?.trim().toUpperCase() === "HADIR";

  async function handleCheckIn() {
    if (!token || !detail || checkingIn) return;

    setCheckingIn(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Lokasi perangkat tidak tersedia."));
            return;
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        }
      );

      await checkIn(
        {
          id_jadwal: detail.id,
          latitude: position.coords.latitude,
          location_accuracy: position.coords.accuracy,
          longitude: position.coords.longitude,
        },
        token
      );
      setCheckedIn(true);
      setAttendanceStatus("HADIR");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Kehadiran belum dapat ditandai."
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
            {!hasAttended && (
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
                (attendanceStatus
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
