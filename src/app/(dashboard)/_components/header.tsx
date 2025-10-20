// src/app/(dashboard)/_components/header.tsx

"use client" // <-- WAJIB: Jadikan Client Component

import LogoutButton from '@/components/auth/logout-button'
import { Profile } from '@/types/database'
// --- IMPOR BARU ---
import { usePathname } from 'next/navigation' 

// --- MAPPING NAMA HALAMAN ---
// Kunci: path URL (seperti yang terlihat di browser)
// Nilai: Teks yang ingin ditampilkan di header
const pathTitles: { [key: string]: string } = {
  '/': 'Beranda Dashboard',
  '/pengaturan': 'Pengaturan Akun',
  '/pengajuan-cuti': 'Ajukan Cuti',
  '/pengajuan-dinas': 'Ajukan Dinas',
  '/status-pengajuan': 'Status Pengajuan Saya',
  '/verifikasi/cuti': 'Verifikasi Cuti',
  '/verifikasi/dinas': 'Verifikasi Dinas',
  '/persetujuan/cuti': 'Persetujuan Cuti',
  '/persetujuan/dinas': 'Persetujuan Dinas',
  '/admin/manajemen-pegawai': 'Manajemen Pegawai',
  '/admin/buat-akun': 'Buat Akun Pegawai',
  // Tambahkan path lain jika ada
};
// --- SELESAI MAPPING ---

export default function Header({ profile }: { profile: Profile }) {
  // --- DAPATKAN PATH SAAT INI ---
  const pathname = usePathname(); 

  // --- CARI JUDUL BERDASARKAN PATH ---
  // Jika path tidak ditemukan di mapping, gunakan judul default
  const title = pathTitles[pathname] || 'SIMRS Kemenham'; 
  // --- SELESAI PENCARIAN JUDUL ---

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        {/* --- UBAH: Gunakan 'title' dinamis --- */}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">
            {profile.nama ?? 'Nama Belum Diisi'}
          </div>
          <div className="text-sm text-gray-500">
            {profile.email ?? 'Email tidak ada'}
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}