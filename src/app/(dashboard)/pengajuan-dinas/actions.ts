// src/app/(dashboard)/pengajuan-dinas/actions.ts
"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DinasFormState } from './types' // Impor tipe dari file baru
import { z } from 'zod'

// --- Skema Validasi di SISI SERVER ---
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'application/pdf', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp'
];

const serverDinasSchema = z.object({
  deskripsi_kegiatan: z.string().min(10),
  // Konversi string dari FormData kembali ke Date
  tgl_mulai: z.preprocess((arg) => new Date(arg as string), z.date()),
  tgl_selesai: z.preprocess((arg) => new Date(arg as string), z.date()),
  // Validasi file di server
  dokumen: z.instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_FILE_SIZE_BYTES)
    .refine((file) => !file || ALLOWED_MIME_TYPES.includes(file.type))
}).refine(data => data.tgl_selesai > data.tgl_mulai);
// --- Akhir Skema Server ---


export async function createPengajuanDinas(
  // UBAH: Menerima FormData
  formData: FormData
): Promise<DinasFormState> {
  
  // 1. Ambil data user yang sedang login
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, message: "Error: Tidak terautentikasi" }
  }

  // 2. Konversi FormData ke object
  const rawData = {
    deskripsi_kegiatan: formData.get('deskripsi_kegiatan'),
    tgl_mulai: formData.get('tgl_mulai'),
    tgl_selesai: formData.get('tgl_selesai'),
    dokumen: formData.get('dokumen') as File | null,
  }

  // 3. Validasi ulang data di server
  const validatedFields = serverDinasSchema.safeParse(rawData)
  if (!validatedFields.success) {
    console.error('Server Validation Error:', validatedFields.error.flatten())
    return {
      success: false,
      message: "Validasi server gagal.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { dokumen, ...pengajuanData } = validatedFields.data;

  // 4. Masukkan data pengajuan dinas (tanpa file)
  const { data: dinasData, error: dinasError } = await supabase
    .from('pengajuan_dinas')
    .insert({
      user_id: user.id,
      deskripsi_kegiatan: pengajuanData.deskripsi_kegiatan,
      tgl_mulai: pengajuanData.tgl_mulai.toISOString(),
      tgl_selesai: pengajuanData.tgl_selesai.toISOString(),
      status: 'menunggu_verifikasi'
    })
    .select('id')
    .single() // Ambil baris yang baru saja dibuat

  if (dinasError) {
    console.error('Supabase error (dinas):', dinasError)
    return { success: false, message: `Error database: ${dinasError.message}` }
  }

  const pengajuanDinasId = dinasData.id; // ID dari pengajuan yang baru dibuat

  // 5. Jika ada file, upload ke Storage
  if (dokumen && dokumen.size > 0) {
    // Buat path file yang unik: <user_id>/dinas-<dinas_id>-<nama_file>
    const fileExt = dokumen.name.split('.').pop();
    const filePath = `${user.id}/dinas-${pengajuanDinasId}.${fileExt}`;

    const { error: storageError } = await supabase.storage
      .from('dokumen_pengajuan') // Nama bucket kita
      .upload(filePath, dokumen);

    if (storageError) {
      console.error('Supabase error (storage):', storageError)
      return { success: false, message: `Gagal meng-upload file: ${storageError.message}` }
    }

    // 6. Jika upload berhasil, catat di tabel 'dokumen_pendukung'
    const { error: docError } = await supabase
      .from('dokumen_pendukung')
      .insert({
        pengajuan_dinas_id: pengajuanDinasId, // <-- INI YANG BERBEDA
        pengajuan_cuti_id: null,              // <-- INI YANG BERBEDA
        nama_file: dokumen.name,
        storage_path: filePath,
        tipe_file: dokumen.type,
      })

    if (docError) {
      console.error('Supabase error (dokumen):', docError)
      return { success: false, message: `Gagal mencatat dokumen: ${docError.message}` }
    }
  }

  // 7. Jika semua berhasil, revalidasi dan redirect
  revalidatePath('/(dashboard)/status-pengajuan')
  revalidatePath('/(dashboard)', 'layout') 
  redirect('/status-pengajuan') 
}