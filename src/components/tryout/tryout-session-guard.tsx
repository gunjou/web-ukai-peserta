"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "ACTIVE_TRYOUT_SESSION";

export default function TryoutSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // halaman yang tidak boleh di-redirect
    const ignoredRoutes = ["/login", "/register", "/forgot-password"];

    if (ignoredRoutes.includes(pathname)) {
      return;
    }

    const sessionStr = localStorage.getItem(STORAGE_KEY);

    if (!sessionStr) return;

    try {
      const session = JSON.parse(sessionStr);

      if (session.endTime <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("attempt_token");
        return;
      }

      const attemptPath = `/tryout/${session.tryoutId}/attempt`;

      if (pathname === attemptPath) return;

      router.replace(attemptPath);
    } catch (error) {
      console.error(error);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("attempt_token");
    }
  }, [pathname, router]);

  return null;
}
