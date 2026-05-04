"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      router.replace("/dashboard/modul-materi");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-background
      "
    >
      <div
        className="
          h-10
          w-10
          rounded-full
          border-4
          border-[var(--brand-gold)]
          border-t-transparent
          animate-spin
        "
      />
    </main>
  );
}
