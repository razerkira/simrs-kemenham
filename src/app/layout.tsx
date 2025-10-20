// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// --- TAMBAHAN BARU ---
import { Toaster } from "@/components/ui/sonner"
// --- SELESAI TAMBAHAN ---

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIMRS Kemenham",
  description: "Smart Integrated Management Reporting System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        {/* --- TAMBAHAN BARU --- */}
        {/* Komponen ini akan menangani semua notifikasi toast */}
        <Toaster richColors />
        {/* --- SELESAI TAMBAHAN --- */}
      </body>
    </html>
  );
}