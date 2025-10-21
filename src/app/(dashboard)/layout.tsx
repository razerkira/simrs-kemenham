// src/app/(dashboard)/layout.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './_components/sidebar'
import Header from './_components/header'
// Impor Tipe data Profile. Kita akan buat file ini.
import { Profile } from '@/types/database' 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // --- TAMBAHAN BARU: AMBIL DATA PROFILE ---
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*') // Ambil semua kolom (nama, nip, role, dll)
    .eq('id', session.user.id) // Dimana ID-nya = ID user yang login
    .single() // Kita tahu hasilnya pasti cuma 1 baris

  // Jika ada error atau profil tidak ditemukan (seharusnya tidak mungkin)
  if (error || !profile) {
    console.error('Error fetching profile:', error)
    // Kamu bisa redirect ke halaman error atau login
    redirect('/login?error=Profile not found')
  }
  // --- SELESAI TAMBAHAN ---

  // Render layout dengan data profile
  return (
    <div className="flex min-h-screen">
      {/* Kirim 'profile' ke Sidebar (untuk role) */}
      <Sidebar profile={profile} />
      
      <div className="flex flex-1 flex-col">
        {/* Kirim 'profile' ke Header (untuk nama & email) */}
        <Header profile={profile} />
        
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}