// src/app/(dashboard)/verifikasi/cuti/actions.ts

"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache' // Untuk refresh tabel
import { z } from 'zod'

// Tipe data untuk hasil return action
export type VerifikasiFormState = {
  message: string
  success: boolean
}

// Skema validasi untuk data yang masuk
const verifikasiSchema = z.object({
  // ID pengajuan yang sedang diproses
  pengajuanId: z.string().uuid("ID pengajuan tidak valid"),
  // Catatan dari verifikator (opsional)
  catatan: z.string().optional(),
  // Aksi yang diambil: 'setuju' atau 'tolak'
  aksi: z.enum(['setuju', 'tolak']),
})

// Ini adalah Server Action yang akan kita panggil
export async function prosesVerifikasiCuti(
  data: z.infer<typeof verifikasiSchema>
): Promise<VerifikasiFormState> {
  
  // 1. Validasi input server-side
  const validatedFields = verifikasiSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
    }
  }

  const { pengajuanId, catatan, aksi } = validatedFields.data

  // 2. Ambil ID verifikator (user yang login)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" }
  }

  // 3. Tentukan status baru berdasarkan aksi
  const statusBaru = 
    aksi === 'setuju' ? 'menunggu_persetujuan' : 'ditolak_verifikator';

  // 4. Update data di database
  const { error } = await supabase
    .from('pengajuan_cuti')
    .update({
      status: statusBaru,
      catatan_verifikator: catatan,
      verifikator_id: user.id, // Catat siapa yang memverifikasi
    })
    .eq('id', pengajuanId) // Hanya update baris yang sesuai
    .eq('status', 'menunggu_verifikasi') // Keamanan: pastikan hanya update yang statusnya masih menunggu

  if (error) {
    console.error('Supabase error (verifikasi cuti):', error)
    return { success: false, message: `Error database: ${error.message}` }
  }

  // 5. Jika berhasil, revalidasi (refresh) data di halaman
  // Ini akan membuat tabel di halaman /verifikasi/cuti otomatis update
  revalidatePath('/(dashboard)/verifikasi/cuti')
  
  return { 
    success: true, 
    message: `Pengajuan berhasil di-${aksi === 'setuju' ? 'setujui' : 'tolak'}!` 
  }
}