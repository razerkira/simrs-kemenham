// src/app/(dashboard)/_components/header.tsx

"use client";

import LogoutButton from "@/components/auth/logout-button";
import { Profile } from "@/types/database";
import { usePathname } from "next/navigation";

const pathTitles: { [key: string]: string } = {
  "/": "Beranda Dashboard",
  "/pengaturan": "Pengaturan Akun",
  "/pengajuan-cuti": "Ajukan Cuti",
  "/pengajuan-dinas": "Ajukan Dinas",
  "/status-pengajuan": "Status Pengajuan Saya",
  "/verifikasi/cuti": "Verifikasi Cuti",
  "/verifikasi/dinas": "Verifikasi Dinas",
  "/persetujuan/cuti": "Persetujuan Cuti",
  "/persetujuan/dinas": "Persetujuan Dinas",
  "/admin/manajemen-pegawai": "Manajemen Pegawai",
  "/admin/buat-akun": "Buat Akun Pegawai",
};

export default function Header({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  const title = pathTitles[pathname] || "SIMRS Kemenham";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">
            {profile.nama ?? "Nama Belum Diisi"}
          </div>
          <div className="text-sm text-gray-500">
            {profile.email ?? "Email tidak ada"}
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
