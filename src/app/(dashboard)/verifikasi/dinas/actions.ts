// src/app/(dashboard)/verifikasi/dinas/actions.ts

"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache' // Untuk refresh tabel
import { z } from 'zod'
import { VerifikasiFormState } from './types' // Impor tipe baru

// Skema validasi untuk data yang masuk
const verifikasiSchema = z.object({
  pengajuanId: z.string().uuid("ID pengajuan tidak valid"),
  catatan: z.string().optional(),
  aksi: z.enum(['setuju', 'tolak']),
})

// Ini adalah Server Action yang akan kita panggil
export async function prosesVerifikasiDinas(
  data: z.infer<typeof verifikasiSchema>
): Promise<VerifikasiFormState> {
  
  // 1. Validasi input
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
  const { error } = await (await supabase)
    // --- UBAH: tabel 'pengajuan_dinas' ---
    .from('pengajuan_dinas')
    .update({
      status: statusBaru,
      catatan_verifikator: catatan,
      verifikator_id: user.id, // Catat siapa yang memverifikasi
    })
    .eq('id', pengajuanId) // Hanya update baris yang sesuai
    .eq('status', 'menunggu_verifikasi') // Keamanan

  if (error) {
    console.error('Supabase error (verifikasi dinas):', error)
    return { success: false, message: `Error database: ${error.message}` }
  }

  // 5. Jika berhasil, revalidasi (refresh) data di halaman
  revalidatePath('/(dashboard)/verifikasi/dinas')
  
  return { 
    success: true, 
    message: `Pengajuan berhasil di-${aksi === 'setuju' ? 'setujui' : 'tolak'}!` 
  }
}