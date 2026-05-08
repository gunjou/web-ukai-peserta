// src/components/shared/providers.tsx
"use client";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="ukai-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
