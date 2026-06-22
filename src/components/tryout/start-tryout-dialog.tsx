"use client";

import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertTriangle,
  Clock3,
  Monitor,
  Wifi,
  BatteryCharging,
  X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  tryoutId: number;
}

export default function StartTryoutDialog({ open, onClose, tryoutId }: Props) {
  const router = useRouter();

  const items = [
    {
      icon: Clock3,
      text: "Waktu tryout tetap berjalan berdasarkan waktu server.",
    },
    {
      icon: Wifi,
      text: "Pastikan koneksi internet stabil selama tryout berlangsung.",
    },
    {
      icon: Monitor,
      text: "Gunakan satu tab/browser selama pengerjaan tryout.",
    },
    {
      icon: BatteryCharging,
      text: "Pastikan perangkat memiliki baterai yang cukup.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader className="hidden"></DialogHeader>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden [&>button]:hidden">
        {/* HEADER */}
        <div className="bg-primary/95 px-6 py-5 text-white">
          {/* CUSTOM CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
              absolute right-4 top-4
              p-2 rounded-md
              hover:text-muted-foreground
              hover:bg-muted/20
              bg-gray-100/50
              text-foreground
              transition
              z-100
              cursor-pointer
            "
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-2">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-lg">
                Konfirmasi Mulai Tryout
              </DialogTitle>

              <DialogDescription className="text-white/80">
                Pastikan Anda sudah siap sebelum memulai.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-3 p-6">
          {items.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                  flex items-start gap-3
                  rounded-xl
                  border
                  bg-muted/40
                  p-3
                "
              >
                <div className="mt-0.5 text-primary">
                  <Icon className="h-4 w-4" />
                </div>

                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            );
          })}

          {/* WARNING */}
          <div
            className="
              rounded-xl
              border border-yellow-300
              bg-yellow-300/10
              p-3 
              font-semibold
              text-sm
              text-muted-foreground
            "
          >
            Setelah tryout dimulai, waktu tidak dapat dihentikan atau diulang
            secara otomatis.
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="
            flex justify-end gap-2
            border-t
            px-6 py-4
          "
        >
          <button
            onClick={onClose}
            className="
              cursor-pointer
              rounded-lg
              border
              px-4 py-2
              text-sm
              transition
              hover:bg-muted
            "
          >
            Batal
          </button>

          <button
            onClick={() => {
              router.push(`/tryout/${tryoutId}`);
            }}
            className="
              cursor-pointer
              rounded-lg
              bg-primary
              px-4 py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-primary/90
            "
          >
            Saya Siap
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
