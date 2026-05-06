// src/components/shared/providers.tsx
"use client";

import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light" // ✅ ubah ke light
      enableSystem={false} // ✅ jangan ikut OS
      storageKey="ukai-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
