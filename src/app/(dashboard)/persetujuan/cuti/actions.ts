// src/app/(dashboard)/persetujuan/cuti/actions.ts

"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache' // Untuk refresh tabel
import { z } from 'zod'
import { PersetujuanFormState } from './types' // Impor tipe baru

// Skema validasi untuk data yang masuk
const persetujuanSchema = z.object({
  pengajuanId: z.string().uuid("ID pengajuan tidak valid"),
  catatan: z.string().optional(),
  aksi: z.enum(['setuju', 'tolak']), // Aksi final
})

// Ini adalah Server Action yang akan kita panggil
export async function prosesPersetujuanCuti(
  data: z.infer<typeof persetujuanSchema>
): Promise<PersetujuanFormState> {
  
  // 1. Validasi input
  const validatedFields = persetujuanSchema.safeParse(data)
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Data yang dikirim tidak valid.",
    }
  }

  const { pengajuanId, catatan, aksi } = validatedFields.data

  // 2. Ambil ID supervisor (user yang login)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" }
  }

  // 3. Tentukan status baru berdasarkan aksi
  const statusBaru = 
    aksi === 'setuju' ? 'disetujui' : 'ditolak_supervisor'; // Status final

  // 4. Update data di database
  const { error } = await supabase
    .from('pengajuan_cuti')
    .update({
      status: statusBaru,
      catatan_supervisor: catatan, // Simpan di kolom supervisor
      supervisor_id: user.id, // Catat siapa yang menyetujui
    })
    .eq('id', pengajuanId) // Hanya update baris yang sesuai
    .eq('status', 'menunggu_persetujuan') // Keamanan: pastikan statusnya benar

  if (error) {
    console.error('Supabase error (persetujuan cuti):', error)
    return { success: false, message: `Error database: ${error.message}` }
  }

  // 5. Jika berhasil, revalidasi (refresh) data di halaman
  revalidatePath('/(dashboard)/persetujuan/cuti')
  // Refresh juga halaman status pegawai, karena datanya berubah
  revalidatePath('/(dashboard)/status-pengajuan') 
  
  return { 
    success: true, 
    message: `Pengajuan berhasil di-${aksi === 'setuju' ? 'setujui' : 'tolak'}!` 
  }
}