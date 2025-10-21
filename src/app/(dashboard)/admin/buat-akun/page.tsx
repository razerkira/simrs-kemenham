// src/app/(dashboard)/admin/buat-akun/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/database'
import BuatAkunForm from './buat-akun-form' // Form (Client)

// Fungsi untuk mengambil data profil user yang sedang login
async function getUserProfile(userId: string): Promise<Pick<Profile, 'role'> | null> {
// --- SELESAI UBAH RETURN TYPE ---
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role') // Cukup ambil role
    .eq('id', userId)
    .single()

  if (error) return null
  return data // Sekarang 'data' cocok dengan return type { role: ... }
}

export default async function BuatAkunPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // --- Keamanan Lapis Kedua ---
  const userProfile = await getUserProfile(session.user.id)
  if (userProfile?.role !== 'admin') {
    redirect('/') // Tendang jika bukan admin
  }
  // --- Akhir Keamanan ---
  
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Buat Akun Pegawai Baru</h1>
      <p className="mb-8 text-gray-600">
        Masukkan data pegawai baru di bawah ini. Akun akan langsung aktif. 
        Pastikan email belum terdaftar.
      </p>
      
      {/* Kita akan buat form ini selanjutnya */}
      <BuatAkunForm />
    </div>
  )
}