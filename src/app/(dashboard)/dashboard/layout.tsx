"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import { getAccessToken } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const token = typeof window !== "undefined" ? getAccessToken() : null;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  // ⛔ jangan render kalau belum ada token
  if (!token) return null;

  return <DashboardShell>{children}</DashboardShell>;
}
