// src/app/layout.tsx

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#EDFBFF]">
        <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-bold flex items-center gap-2"
            >
              <Image
                alt="Logo Kemenham"
                src="/logo_kemenham.png"
                width={32}
                height={32}
              />
              SIMRS KEMENHAM
            </Link>
            <div className="flex items-center space-x-3">
              <Button
                asChild
                className="inline-block bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              >
                <Link href="/login">Login Admin</Link>
              </Button>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
