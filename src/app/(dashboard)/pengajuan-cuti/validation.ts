// src/app/(dashboard)/pengajuan-cuti/validation.ts
import { z } from 'zod';

// --- TAMBAHAN BARU: Aturan Validasi File ---
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Daftar Tipe MIME yang SAMA PERSIS dengan di Supabase Bucket
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg', // .jpg, .jpeg
  'image/png', // .png
  'image/webp' // .webp
];
// --- SELESAI TAMBAHAN ---

export const cutiSchema = z.object({
  jenis_cuti: z.string()
    .min(5, "Jenis cuti atau alasan harus diisi (minimal 5 karakter)."),
  
  tgl_mulai: z.date({
    required_error: "Tanggal mulai harus diisi.",
  }),
  
  tgl_selesai: z.date({
    required_error: "Tanggal selesai harus diisi.",
  }),

  // --- TAMBAHAN BARU: Field 'dokumen' ---
  // Kita gunakan z.instanceof(File)
  dokumen: z.instanceof(File)
    .optional() // Opsional, boleh tidak diisi
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE_BYTES, // Cek ukuran
      `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`
    )
    .refine(
      (file) => !file || ALLOWED_MIME_TYPES.includes(file.type), // Cek tipe
      "Format file tidak didukung. (Hanya PDF, DOC, JPG, PNG, WEBP)"
    )
  // --- SELESAI TAMBAHAN ---

}).refine(data => data.tgl_selesai >= data.tgl_mulai, {
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  path: ["tgl_selesai"],
});