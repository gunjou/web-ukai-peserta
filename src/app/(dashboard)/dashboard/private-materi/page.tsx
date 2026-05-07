// app/(dashboard)/dashboard/private-materi/page.tsx
"use client";

import { useUserStore } from "@/stores/user.store";
import MateriList from "@/components/materi/materi-list";
import EmptyState from "@/components/shared/empty-state";
import { usePrivateMateri } from "@/hooks/usePrivateMateri";

export default function PrivateMateriPage() {
  const user = useUserStore((s) => s.user);

  const { data, loading } = usePrivateMateri("document");

  const mentorName = user?.mentorships?.[0]?.mentor_name || "Mentor";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Materi Private</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            PRO
          </span>
        </div>

        <p className="mt-1 text-muted-foreground">
          Materi eksklusif bersama kak{" "}
          <span className="font-semibold text-primary">{mentorName}</span>
        </p>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[140px] animate-pulse bg-muted rounded-xl"
            />
          ))}
        </div>
      ) : data === null ? (
        <EmptyState
          title="Belum Ada Materi Private"
          description="Materi dari mentor belum tersedia."
        />
      ) : (
        <MateriList materi={data} />
      )}
    </div>
  );
}
