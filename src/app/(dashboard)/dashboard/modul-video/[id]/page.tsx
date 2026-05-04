"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import EmptyState from "@/components/shared/empty-state";

import VideoList from "@/components/video/video-list";

import { getMateriByModul, Materi } from "@/services/materi.service";

import { getAccessToken } from "@/lib/auth";

export default function ModulVideoDetailPage() {
  const params = useParams();

  const modulId = params.id as string;

  const [videos, setVideos] = useState<Materi[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const token = getAccessToken();

        if (!token) return;

        const result = await getMateriByModul(modulId, "video", token);

        setVideos(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [modulId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Video Pembelajaran
        </h1>

        <p
          className="
            mt-1
            text-muted-foreground
          "
        >
          Daftar video tersedia untuk modul ini.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div
          className="
            grid
            grid-cols-1
            gap-4

            lg:grid-cols-2
          "
        >
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-[180px]
                animate-pulse
                rounded-2xl
                bg-muted
              "
            />
          ))}
        </div>
      ) : videos === null ? (
        <EmptyState
          title="Belum Ada Video"
          description="Video untuk modul ini belum tersedia."
        />
      ) : (
        <VideoList videos={videos} />
      )}
    </div>
  );
}
