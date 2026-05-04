"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getAccessToken } from "@/lib/auth";
import { getMe } from "@/services/user.service";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  url: string;
  title: string;

  type: "document" | "video";
}

// helper untuk handle embed
function getEmbedUrl(url: string, type: "document" | "video") {
  // document (pdf, materi)
  if (type === "document") {
    return url.replace("/view", "/preview");
  }

  // video (google drive)
  if (type === "video") {
    if (url.includes("drive.google.com")) {
      const fileId = url.split("/d/")[1]?.split("/")[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  return url;
}

export default function ContentViewer({
  open,
  onOpenChange,
  url,
  title,
  type,
}: Props) {
  const embedUrl = getEmbedUrl(url, type);

  const [user, setUser] = useState<null | {
    name: string;
    email: string;
  }>(null);

  useEffect(() => {
    async function fetchUser() {
      const token = getAccessToken();
      if (!token) return;

      try {
        const res = await getMe(token);
        setUser(res.data);
      } catch (e) {
        console.error("Failed fetch user:", e);
      }
    }

    if (open) {
      fetchUser(); // 🔥 hanya fetch saat viewer dibuka
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          p-0
          border-none
          !max-w-none
          w-screen
          h-screen
          rounded-none
          overflow-hidden

          gap-0 
          flex flex-col
          [&>button]:hidden
        "
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>

        {/* HEADER */}
        <div
          className="
            sticky top-0
            flex
            items-center
            justify-between
            pt-10
            md:pt-0
            px-3
            py-2
            bg-black/70
            backdrop-blur
            text-white
            z-[1000]
            shrink-0
          "
        >
          <p
            className="
              p-1.5
              text-sm
              md:text-base
              font-semibold
              truncate
              max-w-[85%]
            "
          >
            {title}
          </p>

          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-md hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 bg-black relative z-0 min-h-0">
          {/* IFRAME */}
          <iframe
            src={embedUrl}
            className="w-full h-full block border-0 relative z-0"
            allow="autoplay; fullscreen"
          />

          {/* WATERMARK */}
          {user && (
            <div
              className="
                absolute
                inset-0
                z-[199]
                pointer-events-none
                flex
                flex-wrap
                text-black
                opacity-8
                text-2xl md:text-3xl
                font-bold
              "
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="
                    w-1/3
                    rotate-[-25deg]
                    text-center
                    py-6
                  "
                >
                  {user.name}
                </div>
              ))}
            </div>
          )}

          {/* PROTECTION OVERLAY (pojok kanan) */}
          <div
            className={`
              absolute
              top-0.5
              right-0.5
              lg:w-[138px]
              lg:h-[80px]
              md:w-[70px]
              md:h-[70px]
              w-[70px]
              h-[70px]
              backdrop-blur-sm
              rounded-xl
              z-[200]
              ${type === "document" ? "bg-[#1e1e1e]/80" : "bg-black/80"}
  `}
          />

          {/* LOGO OVERLAY */}
          <Image
            src="/images/logo_syndrome.svg"
            alt="UKAI Syndrome"
            width={50}
            height={50}
            className="
              absolute
              top-2
              right-2
              z-[210]
              opacity-80
              pointer-events-none
            "
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
