import { createServerClient, type CookieOptions } from '@supabase/ssr' // Import CookieOptions if needed by createServerClient
import { cookies } from 'next/headers' // Keep this import

// Make the function async
export async function createClient() {
  // Use await here
  const cookieStore = await cookies()

  // Buat sebuah Supabase client untuk di sisi Server
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Now cookieStore is the actual store, not a promise
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) { // Add CookieOptions type
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // 'set' dipanggil dari Server Component,
            // bisa diabaikan jika kamu punya middleware
          }
        },
        remove(name: string, options: CookieOptions) { // Add CookieOptions type
          try {
            // Use 'set' with empty value and expired date for deletion in App Router
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // 'delete' dipanggil dari Server Component,
            // bisa diabaikan jika kamu punya middleware
          }
        },
      },
    }
  )
}