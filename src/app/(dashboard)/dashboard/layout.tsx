// src/app/(dashboard)/dashboard/layout.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getAccessToken } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    // 🔥 beri async boundary
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [router]);

  if (loading) return null;

  return <DashboardShell>{children}</DashboardShell>;
}
