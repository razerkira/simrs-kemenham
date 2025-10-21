// src/app/(dashboard)/status-pengajuan/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// --- UBAH: Impor kedua tipe ---
import { PengajuanCuti, PengajuanDinas } from '@/types/database'
import StatusTable from './status-table'

// Fungsi untuk mengambil riwayat cuti
async function getRiwayatCuti(userId: string): Promise<PengajuanCuti[]> {
  const supabase = createClient()
  const { data, error } = await (await supabase)
    .from('pengajuan_cuti')
    .select(`
      *, 
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `) // <-- Kita ambil SEMUA kolom cuti (*) + dokumen
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching riwayat cuti:', error)
    return []
  }
  return data
}

// --- BARU: Fungsi untuk mengambil riwayat dinas ---
async function getRiwayatDinas(userId: string): Promise<PengajuanDinas[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pengajuan_dinas')
    .select(`
      *, 
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `) // <-- Ambil SEMUA kolom dinas (*) + dokumen
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching riwayat dinas:', error)
    return []
  }
  return data
}
// --- SELESAI BARU ---

export default async function StatusPengajuanPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // --- UBAH: Panggil kedua fungsi ---
  const dataCuti = await getRiwayatCuti(session.user.id)
  const dataDinas = await getRiwayatDinas(session.user.id)
  // --- SELESAI UBAH ---

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold">Status Pengajuan Saya</h1>
      <p className="mb-8 text-gray-600">
        Pantau status semua pengajuan cuti dan dinas Anda di halaman ini.
      </p>
      
      {/* --- UBAH: Kirim kedua data ke komponen Client --- */}
      <StatusTable dataCuti={dataCuti} dataDinas={dataDinas} />
    </div>
  )
}