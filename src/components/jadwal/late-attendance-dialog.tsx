"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitAbsensiSusulan } from "@/services/schedule.service";

interface Props {
  open: boolean;
  onClose: () => void;
  scheduleId: number;
  token: string;
  onSuccess: () => void;
}

export default function LateAttendanceDialog({
  open,
  onClose,
  scheduleId,
  token,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (loading) return;
    setFile(null);
    setReason("");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log(scheduleId);

    if (!file) {
      setError("Pilih foto bukti kehadiran terlebih dahulu.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Foto harus berformat JPEG, PNG, atau WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitAbsensiSusulan(
        {
          id_jadwal: scheduleId,
          file,
          alasan_absensi_susulan: reason.trim() || undefined,
        },
        token,
      );

      setFile(null);
      setReason("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Pengajuan absensi susulan gagal.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="z-[60] max-w-sm rounded-2xl p-0 [&>button]:hidden">
        <DialogHeader className="border-b px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold">
                Absensi Susulan
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Kirim bukti kehadiran untuk diverifikasi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="space-y-2">
            <label
              htmlFor="late-attendance-file"
              className="text-sm font-medium"
            >
              Foto bukti kehadiran <span className="text-red-500">*</span>
            </label>
            <label
              htmlFor="late-attendance-file"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition hover:bg-muted/50"
            >
              <Upload className="h-5 w-5 shrink-0 text-amber-600" />
              <span className="min-w-0 text-sm">
                <span className="block truncate font-medium">
                  {file?.name ?? "Pilih foto"}
                </span>
                <span className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP · Maks. 5 MB
                </span>
              </span>
            </label>
            <input
              id="late-attendance-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="late-attendance-reason"
              className="text-sm font-medium"
            >
              Alasan <span className="text-muted-foreground">(opsional)</span>
            </label>
            <textarea
              id="late-attendance-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Tuliskan alasan pengajuan..."
              className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
