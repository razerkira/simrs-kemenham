// src/app/(dashboard)/persetujuan/dinas/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// Kita pakai Tipe Gabungan 'Dinas' yang sudah kita buat
import { PengajuanDinasWithProfile } from '@/types/database' 
// Kita akan buat tabel baru untuk persetujuan dinas
import PersetujuanDinasTable from './persetujuan-dinas-table' 

// Fungsi untuk mengambil data pengajuan dinas yang perlu disetujui
async function getPengajuanDinasUntukDisetujui(): Promise<PengajuanDinasWithProfile[]> {
  const supabase = createClient()
  
  const { data, error } = await (await supabase)
    .from('pengajuan_dinas') // Ambil dari 'pengajuan_dinas'
    // Query "Join" 3-tabel yang sama
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
    // --- INI PERBEDAAN UTAMANYA ---
    .eq('status', 'menunggu_persetujuan') // Hanya yang statusnya menunggu persetujuan
    // --- SELESAI PERBEDAAN ---
    .order('created_at', { ascending: true }) // Tampilkan yang paling lama dulu

  if (error) {
    console.error('Error fetching pengajuan dinas untuk persetujuan:', error)
    return []
  }
  
  return data as PengajuanDinasWithProfile[]
}

export default async function PersetujuanDinasPage() {
  const dataPengajuan = await getPengajuanDinasUntukDisetujui()
  
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Persetujuan Akhir Dinas</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan berikan persetujuan akhir untuk pengajuan dinas luar di bawah ini.
      </p>
      
      {/* Kita kirim data ke komponen Client */}
      <PersetujuanDinasTable dataPengajuan={dataPengajuan} />
    </div>
  )
}