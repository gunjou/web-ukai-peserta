// src/components/shared/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        flex
        h-10
        w-10
        cursor-pointer
        items-center
        justify-center
        rounded-xl
        border
        bg-card
        transition-all
        hover:bg-muted
      "
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
