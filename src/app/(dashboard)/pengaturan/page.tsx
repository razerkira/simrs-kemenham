// src/app/(dashboard)/pengaturan/page.tsx

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
// Kita akan buat komponen form-nya setelah ini
import SettingsForm from './settings-form'
import { Profile } from '@/types/database'

export default async function PengaturanPage() {
  const supabase = await createClient()

  // 1. Ambil data sesi (untuk tahu siapa yang login)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // 2. Ambil data profil LENGKAP dari user yang login
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching profile for settings', error)
    redirect('/') // Kembali ke dashboard jika ada error
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Pengaturan Akun</h1>
      <p className="mb-8 text-gray-600">
        Perbarui data diri dan informasi kepegawaian Anda di sini.
      </p>
      
      {/* Kita kirim 'profile' ke komponen form
        agar form-nya bisa terisi data yang sudah ada 
      */}
      <SettingsForm profile={profile} />
    </div>
  )
}