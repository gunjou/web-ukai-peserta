"use client";

import { PlayCircle, ExternalLink } from "lucide-react";

import { Materi } from "@/services/materi.service";
import ContentViewer from "../viewer/content-viewer";
import { useState } from "react";

interface Props {
  video: Materi;
}

export default function VideoCard({ video }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        rounded-2xl
        border
        bg-card
        p-5
        transition-all
        hover:border-primary/30
      "
    >
      {/* Icon */}
      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >
        <PlayCircle className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3
        className="
          line-clamp-2
          text-base
          font-semibold
        "
      >
        {video.title}
      </h3>

      {/* Action */}
      <div className="mt-5">
        <button
          onClick={() => setOpen(true)}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-primary
            px-4
            py-2
            text-sm
            font-medium
            text-primary-foreground
            transition-all
            hover:opacity-90
          "
        >
          <ExternalLink className="h-4 w-4" />
          Tonton Video
        </button>
      </div>
      <ContentViewer
        open={open}
        onOpenChange={setOpen}
        url={video.url}
        title={video.title}
        type="video"
      />
    </div>
  );
}
