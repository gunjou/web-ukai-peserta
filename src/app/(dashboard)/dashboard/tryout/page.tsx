// app/(dashboard)/dashboard/tryout/page.tsx
"use client";

import { useEffect, useState } from "react";

import EmptyState from "@/components/shared/empty-state";

import { getTryouts, Tryout } from "@/services/tryout.service";
import TryoutItem from "@/components/tryout/tryout-item";
import TryoutSkeleton from "@/components/tryout/tryout-skeleton";

export default function TryoutPage() {
  const [tryouts, setTryouts] = useState<Tryout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTryouts() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) return;

        const result = await getTryouts(token);

        setTryouts(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchTryouts();
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Tryout</h1>

        <p className="mt-1 text-muted-foreground">
          Kerjakan tryout untuk mengukur kemampuan Anda.
        </p>
      </div>

      {/* LOADING (SKELETON) */}
      {loading ? (
        <TryoutSkeleton />
      ) : tryouts.length === 0 ? (
        <EmptyState
          title="Belum Ada Tryout"
          description="Tryout belum tersedia untuk akun Anda."
        />
      ) : (
        <div className="space-y-4">
          {tryouts.map((item) => (
            <TryoutItem key={item.id} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}
