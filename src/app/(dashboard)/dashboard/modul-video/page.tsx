"use client";

import { useEffect, useState } from "react";

import { getModulPeserta, Modul } from "@/services/modul.service";
import ModulGrid from "@/components/modul/modul-grid";
import { getAccessToken } from "@/lib/auth";
import EmptyState from "@/components/shared/empty-state";

export default function ModulVideoPage() {
  const [modules, setModules] = useState<Modul[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const token = getAccessToken();

        console.log("Fetching modules with token:", token);

        if (!token) return;

        const result = await getModulPeserta(token);

        setModules(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchModules();
  }, []);

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
          Modul Video
        </h1>

        <p
          className="
            mt-1
            text-muted-foreground
          "
        >
          Pilih modul untuk melihat video pembelajaran.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2

            xl:grid-cols-3
          "
        >
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="
                h-[150px]
                animate-pulse
                rounded-2xl
                bg-muted
              "
            />
          ))}
        </div>
      ) : modules === null ? (
        <EmptyState
          title="Belum Ada Modul"
          description="Modul Video belum tersedia untuk akun Anda."
        />
      ) : (
        <ModulGrid modules={modules} basePath="/dashboard/modul-video" />
      )}
    </div>
  );
}
