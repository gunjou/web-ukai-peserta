"use client";

import { Download, FileText, ExternalLink } from "lucide-react";

import { Materi } from "@/services/materi.service";
import { useState } from "react";
import ContentViewer from "../viewer/content-viewer";

interface Props {
  materi: Materi;
}

export default function MateriCard({ materi }: Props) {
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
        <FileText className="h-6 w-6" />
      </div>

      {/* Title */}
      <h3
        className="
          line-clamp-2
          text-base
          font-semibold
        "
      >
        {materi.title}
      </h3>

      {/* Actions */}
      <div
        className="
          mt-5
          flex
          items-center
          gap-3
        "
      >
        {/* View */}
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
          Lihat
        </button>

        {/* Download */}
        {materi.is_downloadable === 1 && (
          <button
            onClick={() => window.open(materi.url, "_blank")}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-4
              py-2
              text-sm
              font-medium
              transition-all
              hover:bg-muted
            "
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        )}
      </div>
      <ContentViewer
        open={open}
        onOpenChange={setOpen}
        url={materi.url}
        title={materi.title}
        type="document"
      />
    </div>
  );
}
