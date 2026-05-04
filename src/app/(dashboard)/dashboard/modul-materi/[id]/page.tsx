"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import EmptyState from "@/components/shared/empty-state";
import MateriList from "@/components/materi/materi-list";

import { getMateriByModul, Materi } from "@/services/materi.service";

import { getAccessToken } from "@/lib/auth";

export default function ModulMateriDetailPage() {
  const params = useParams();

  const modulId = params.id as string;

  const [materi, setMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMateri() {
      try {
        const token = getAccessToken();

        if (!token) return;

        const result = await getMateriByModul(modulId, "document", token);

        setMateri(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMateri();
  }, [modulId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Materi Modul</h1>

        <p className="mt-1 text-muted-foreground">
          Daftar materi tersedia pada modul ini.
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
          {Array.from({ length: 4 }).map((_, index) => (
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
      ) : materi === null ? (
        <EmptyState
          title="Belum Ada Materi"
          description="Materi untuk modul ini belum tersedia."
        />
      ) : (
        <MateriList materi={materi} />
      )}
    </div>
  );
}
