// src/app/(dashboard)/verifikasi/dinas/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// --- UBAH: Gunakan tipe data 'Dinas' yang baru ---
import { PengajuanDinasWithProfile } from '@/types/database'
// --- UBAH: Tunjuk ke tabel 'Dinas' ---
import VerifikasiDinasTable from './verifikasi-dinas-table'

// Fungsi untuk mengambil data pengajuan dinas yang MASUK
async function getPengajuanDinasMasuk(): Promise<PengajuanDinasWithProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (await supabase)
    // --- UBAH: 'from' pengajuan_dinas ---
    .from('pengajuan_dinas')
    // Query "Join" 3-tabel
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
    .eq('status', 'menunggu_verifikasi') // Hanya yang statusnya menunggu
    .order('created_at', { ascending: true }) // Tampilkan yang paling lama dulu

  if (error) {
    console.error('Error fetching pengajuan dinas masuk:', error)
    return []
  }
  
  return data as PengajuanDinasWithProfile[]
}

export default async function VerifikasiDinasPage() {
  const dataPengajuan = await getPengajuanDinasMasuk()
  
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Verifikasi Pengajuan Dinas</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan proses pengajuan dinas luar yang masuk dari para pegawai.
      </p>
      
      {/* --- UBAH: Kirim ke komponen tabel 'Dinas' --- */}
      <VerifikasiDinasTable dataPengajuan={dataPengajuan} />
    </div>
  )
}