// src/components/shared/theme-toggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // prevent hydration mismatch
  if (!mounted) {
    return (
      <div
        className="
          h-10
          w-10
          rounded-xl
          border
        "
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        flex
        h-10
        w-10
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
