// src/app/(dashboard)/verifikasi/cuti/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PengajuanCutiWithProfile } from '@/types/database' // Tipe gabungan
import VerifikasiCutiTable from './verifikasi-cuti-table' // Tabel (Client)

// Fungsi untuk mengambil data pengajuan cuti yang MASUK
async function getPengajuanCutiMasuk(): Promise<PengajuanCutiWithProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (await supabase)
    .from('pengajuan_cuti')
    // --- INI ADALAH "JOIN" VERSI SUPABASE ---
    // Kita ambil semua kolom dari 'pengajuan_cuti' (*),
    // dan kolom 'nama', 'nip', 'unit_kerja' dari tabel 'profiles'
    // yang terhubung via 'user_id'
    .select(`
      *, 
      profiles:user_id (
        nama, 
        nip, 
        unit_kerja
      ),
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `)
    // --- AKHIR JOIN ---
    .eq('status', 'menunggu_verifikasi') // Hanya yang statusnya menunggu
    .order('created_at', { ascending: true }) // Tampilkan yang paling lama dulu

  if (error) {
    console.error('Error fetching pengajuan cuti masuk:', error)
    return []
  }
  
  // Kita 'cast' datanya sebagai tipe gabungan kita
  return data as PengajuanCutiWithProfile[]
}

export default async function VerifikasiCutiPage() {
  const dataPengajuan = await getPengajuanCutiMasuk()
  
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Verifikasi Pengajuan Cuti</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan proses pengajuan cuti yang masuk dari para pegawai.
      </p>
      
      {/* Kita kirim data gabungan ke komponen Client */}
      <VerifikasiCutiTable dataPengajuan={dataPengajuan} />
    </div>
  )
}