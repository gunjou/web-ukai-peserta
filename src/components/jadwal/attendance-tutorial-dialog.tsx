"use client";

import { Monitor, PlayCircle, Smartphone, X } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TutorialType = "desktop" | "mobile";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TUTORIAL_VIDEOS = {
  desktop:
    "https://mgf.ukaisyndrome.id/images/ukaisyndrome/2026/assets/tutorial_absensi_desktop.mp4",
  mobile:
    "https://mgf.ukaisyndrome.id/images/ukaisyndrome/2026/assets/tutorial_absensi_mobile.mp4",
};

export default function AttendanceTutorialDialog({ open, onClose }: Props) {
  const [tutorialType, setTutorialType] = useState<TutorialType>("desktop");

  const videoUrl = TUTORIAL_VIDEOS[tutorialType];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-2xl p-0 [&>button]:hidden">
        {/* HEADER */}
        <DialogHeader className="border-b bg-muted/30 px-5 py-4 sm:px-6">
          {/* CUSTOM CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute right-4 top-4 z-10 flex h-8 w-8
              items-center justify-center rounded-lg
              text-muted-foreground transition
              hover:bg-muted hover:text-foreground
            "
            aria-label="Tutup tutorial"
          >
            <X className="h-5 w-5" />
          </button>

          <DialogTitle className="pr-8 text-base font-semibold sm:text-lg">
            Tutorial Kehadiran
          </DialogTitle>

          <DialogDescription className="pr-8 text-xs sm:text-sm">
            Pelajari cara menandai kehadiran melalui browser yang Anda gunakan.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENT */}
        <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
          {/* DEVICE SWITCH */}
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setTutorialType("desktop")}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg
                px-3 py-2 text-xs font-medium transition
                sm:text-sm
                ${
                  tutorialType === "desktop"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Monitor className="h-4 w-4" />
              <span>Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setTutorialType("mobile")}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg
                px-3 py-2 text-xs font-medium transition
                sm:text-sm
                ${
                  tutorialType === "mobile"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <Smartphone className="h-4 w-4" />
              <span>Mobile</span>
            </button>
          </div>

          {/* VIDEO */}
          <div className="overflow-hidden rounded-xl bg-black">
            <video
              key={videoUrl}
              className="
                aspect-video w-full object-contain
                bg-black
              "
              controls
              playsInline
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Browser Anda tidak mendukung pemutaran video.
            </video>
          </div>

          {/* DESCRIPTION */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
            <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              Tutorial{" "}
              <span className="font-medium text-foreground">
                {tutorialType === "desktop" ? "Desktop" : "Mobile"}
              </span>{" "}
              menunjukkan langkah-langkah untuk menandai kehadiran pada
              pertemuan kelas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
