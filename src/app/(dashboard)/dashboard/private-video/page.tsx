// app/(dashboard)/dashboard/private-video/page.tsx
"use client";

import { useUserStore } from "@/stores/user.store";
import VideoList from "@/components/video/video-list";
import EmptyState from "@/components/shared/empty-state";
import { usePrivateMateri } from "@/hooks/usePrivateMateri";

export default function PrivateVideoPage() {
  const user = useUserStore((s) => s.user);

  const { data, loading } = usePrivateMateri("video");

  const mentorName = user?.mentorships?.[0]?.mentor_name || "Mentor";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Video Private</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            PRO
          </span>
        </div>

        <p className="mt-1 text-muted-foreground">
          Video eksklusif bersama kak{" "}
          <span className="font-semibold text-primary">{mentorName}</span>
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse bg-muted rounded-xl"
            />
          ))}
        </div>
      ) : data === null ? (
        <EmptyState
          title="Belum Ada Video Private"
          description="Video dari mentor belum tersedia."
        />
      ) : (
        <VideoList videos={data} />
      )}
    </div>
  );
}
