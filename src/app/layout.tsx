import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import Providers from "../components/shared/providers";
import TryoutSessionGuard from "@/components/tryout/tryout-session-guard";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Syndrome UKAI",
  description: "Platform Pembelajaran Syndrome UKAI",
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
        <Providers>
          <TryoutSessionGuard />
          {children}
        </Providers>
      </body>
    </html>
  );
}
