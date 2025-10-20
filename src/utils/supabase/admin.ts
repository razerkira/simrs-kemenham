// src/utils/supabase/admin.ts

import { createClient } from '@supabase/supabase-js'

// Perhatikan: Kita pakai createClient dari @supabase/supabase-js langsung
// karena ini HANYA akan dipakai di server (Server Actions)

export function createAdminClient() {
  // Ambil URL dan Service Role Key dari environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing from environment variables.')
  }

  // Buat Supabase client yang menggunakan Service Role Key
  // Ini memberinya akses penuh ke database & auth admin
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Penting: Auto refresh token harus dimatikan untuk admin client
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Catatan Keamanan: 
// JANGAN PERNAH impor atau gunakan fungsi ini di client-side code (`"use client"`)
// atau di middleware. Gunakan HANYA di dalam Server Actions (`"use server"`)
// atau Route Handlers (API Routes).