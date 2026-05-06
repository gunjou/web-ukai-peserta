// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import Providers from "../components/shared/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "UKAI Syndrome",
  description: "Platform Pembelajaran UKAI Syndrome",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning className="light">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
