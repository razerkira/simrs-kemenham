// src/app/(dashboard)/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/database' // Kita butuh tipe Profile
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ListChecks, PlaneTakeoff } from "lucide-react"

// Tipe data gabungan untuk hasil query
type AktivitasPegawai = {
  id: string
  nama: string | null
  keterangan: string // Bisa jenis cuti atau deskripsi dinas
}

// Fungsi untuk mengambil data cuti hari ini
async function getCutiHariIni(): Promise<AktivitasPegawai[]> {
  const supabase = createClient()
  const today = new Date();
  // Set ke awal hari
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(); 
  // Set ke akhir hari
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

  const { data, error } = await supabase
    .from('pengajuan_cuti')
    .select(`
      id,
      jenis_cuti,
      profiles:user_id ( nama )
    `)
    .eq('status', 'disetujui')
    // Tanggal mulai <= hari ini DAN Tanggal selesai >= hari ini
    .lte('tgl_mulai', startOfDay) 
    .gte('tgl_selesai', startOfDay) // Cukup cek startOfDay karena tipe 'date'

  if (error) {
    console.error("Error fetching cuti hari ini:", error);
    return [];
  }

  // Ubah format data agar seragam
  return data.map(item => ({
    id: item.id,
    nama: item.profiles?.nama ?? 'N/A',
    keterangan: item.jenis_cuti
  }))
}

// Fungsi untuk mengambil data dinas hari ini
async function getDinasHariIni(): Promise<AktivitasPegawai[]> {
  const supabase = createClient()
  const now = new Date().toISOString(); // Waktu saat ini

  const { data, error } = await supabase
    .from('pengajuan_dinas')
    .select(`
      id,
      deskripsi_kegiatan,
      profiles:user_id ( nama )
    `)
    .eq('status', 'disetujui')
    // Waktu mulai <= sekarang DAN Waktu selesai >= sekarang
    .lte('tgl_mulai', now) 
    .gte('tgl_selesai', now)

  if (error) {
    console.error("Error fetching dinas hari ini:", error);
    return [];
  }
  
  // Ubah format data agar seragam
  return data.map(item => ({
    id: item.id,
    nama: item.profiles?.nama ?? 'N/A',
    keterangan: item.deskripsi_kegiatan
  }))
}


export default async function HomePage() {
  // Ambil data aktivitas
  const pegawaiCuti = await getCutiHariIni();
  const pegawaiDinas = await getDinasHariIni();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Aktivitas Harian</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        
        {/* Card Pegawai Cuti */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pegawai Cuti Hari Ini</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pegawaiCuti.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pegawaiCuti.map((pegawai) => (
                  <li key={pegawai.id} className="py-3">
                    <p className="font-medium">{pegawai.nama}</p>
                    <p className="text-sm text-gray-600">{pegawai.keterangan}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada pegawai yang cuti hari ini.</p>
            )}
          </CardContent>
        </Card>

        {/* Card Pegawai Dinas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pegawai Dinas Luar Hari Ini</CardTitle>
            <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pegawaiDinas.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pegawaiDinas.map((pegawai) => (
                  <li key={pegawai.id} className="py-3">
                    <p className="font-medium">{pegawai.nama}</p>
                    <p className="text-sm text-gray-600">{pegawai.keterangan}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada pegawai yang dinas luar hari ini.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}