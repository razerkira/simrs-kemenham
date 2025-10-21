// src/app/(dashboard)/admin/manajemen-pegawai/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/database' // Kita sudah punya tipe 'Profile'
import ManajemenPegawaiTable from './manajemen-pegawai-table' // Tabel (Client)

// Fungsi untuk mengambil data profil user yang sedang login
async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) return null
  return data
}

// Fungsi untuk mengambil SEMUA profil pegawai (Hanya Admin)
async function getAllPegawai(): Promise<Profile[]> {
  const supabase = await createClient()
  
  // Query ini HANYA akan berhasil karena RLS Policy 'admin' kita
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('nama', { ascending: true }) // Urutkan A-Z

  if (error) {
    console.error('Error fetching all pegawai:', error)
    return []
  }
  
  return data
}

export default async function ManajemenPegawaiPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // --- Keamanan Lapis Kedua ---
  // Kita cek role user di server sebelum me-render halaman
  const userProfile = await getUserProfile(session.user.id)
  
  if (userProfile?.role !== 'admin') {
    // Jika bukan admin, tendang ke dashboard
    redirect('/')
  }
  // --- Akhir Keamanan ---

  // Jika lolos, ambil semua data pegawai
  const dataPegawai = await getAllPegawai()
  
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Manajemen Data Pegawai</h1>
      <p className="mb-8 text-gray-600">
        Kelola data profil, akun, dan role untuk semua pegawai Kemenham.
      </p>
      
      {/* Kita kirim data ke komponen Client */}
      <ManajemenPegawaiTable dataPegawai={dataPegawai} />
    </div>
  )
}