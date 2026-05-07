// app/(dashboard)/dashboard/private-materi/page.tsx
"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/user.store";
import MateriList from "@/components/materi/materi-list";
import VideoList from "@/components/video/video-list";
import EmptyState from "@/components/shared/empty-state";
import { usePrivateMateri } from "@/hooks/usePrivateMateri";

export default function PrivatePage() {
  const user = useUserStore((s) => s.user);

  const [tab, setTab] = useState<"document" | "video">("document");

  const { data, loading } = usePrivateMateri(tab);

  const mentorName = user?.mentorships?.[0]?.mentor_name || "Mentor";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Private Class</h1>

        <p className="mt-1 text-xs text-muted-foreground">
          Konten eksklusif bersama
          <br /> kak{" "}
          <span className="font-semibold text-primary">{mentorName}</span>
        </p>
      </div>

      {/* TAB */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("document")}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition
            ${
              tab === "document"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            }
          `}
        >
          Materi
        </button>

        <button
          onClick={() => setTab("video")}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium transition
            ${
              tab === "video"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground"
            }
          `}
        >
          Video
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[140px] bg-muted animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : data === null ? (
        <EmptyState
          title="Belum Ada Konten"
          description="Konten private belum tersedia."
        />
      ) : tab === "document" ? (
        <MateriList materi={data} />
      ) : (
        <VideoList videos={data} />
      )}
    </div>
  );
}
