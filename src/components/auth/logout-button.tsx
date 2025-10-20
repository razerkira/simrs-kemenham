// src/app/logout-button.tsx

"use client" // Wajib! Karena ini adalah aksi di browser

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
// Kita pakai button dari Shadcn UI
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Arahkan kembali ke halaman login dan refresh
    router.push('/login')
    router.refresh()
  }

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  )
}