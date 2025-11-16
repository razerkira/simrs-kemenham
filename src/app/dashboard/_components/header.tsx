// src/app/(dashboard)/_components/header.tsx
"use client";

import LogoutButton from "@/components/auth/logout-button";
import { Profile, UserProfile } from "@/types/database";
import { usePathname } from "next/navigation";
// --- IMPOR BARU ---
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react"; // Ikon Burger Menu
import NotificationPopover from "@/components/notification/notification-popover";

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

// --- UBAH PROPS HEADER ---
interface HeaderProps {
  profile: UserProfile | Profile;
  toggleSidebar: () => void; // Terima fungsi toggle
}

export default function Header({ profile, toggleSidebar }: HeaderProps) {
  // Ambil toggleSidebar
  const pathname = usePathname();
  const title = pathTitles[pathname] || "SIMRS Kemenham";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      {" "}
      {/* Ubah padding jika perlu */}
      {/* --- BAGIAN KIRI HEADER (Tombol + Judul) --- */}
      <div className="flex items-center gap-3">
        {" "}
        {/* Bungkus dengan flex */}
        {/* Tombol Burger */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        {/* Judul Halaman */}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {/* --- SELESAI BAGIAN KIRI --- */}
      {/* Bagian Kanan Header (Info User + Logout - Tidak Berubah) */}
      <div className="flex items-center gap-4">
        <NotificationPopover />
        <div className="text-right">
          <div className="font-medium">
            {profile?.name ?? "Nama Belum Diisi"}
          </div>
          <div className="text-sm text-gray-500">
            {profile?.email ?? "Email tidak ada"}
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
