// src/app/(auth)/login/login-form.tsx

"use client" // Wajib! Karena pakai hook dan interaksi browser

import { createClient } from '@/utils/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginForm() {
  const supabase = createClient()
  const router = useRouter()

  // Efek untuk me-redirect jika user sudah login
  // atau jika login baru saja berhasil
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // Redirect ke halaman dashboard setelah login berhasil
          router.push('/')
          router.refresh() // Refresh untuk mengambil data user baru
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      theme="light" // Kamu bisa ganti "dark" jika mau
      providers={[]} // Kosongkan array-nya agar hanya tampil Email/Password
      redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
      socialLayout="horizontal"
      showLinks={true} // Tampilkan link "Lupa Password"
    />
  )
}