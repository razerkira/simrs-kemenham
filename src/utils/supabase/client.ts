import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Buat sebuah Supabase client untuk di sisi Browser/Client
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}