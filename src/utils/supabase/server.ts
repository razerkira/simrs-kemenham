import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  // Buat sebuah Supabase client untuk di sisi Server
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // 'set' dipanggil dari Server Component, 
            // bisa diabaikan jika kamu punya middleware
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // 'delete' dipanggil dari Server Component,
            // bisa diabaikan jika kamu punya middleware
          }
        },
      },
    }
  )
}