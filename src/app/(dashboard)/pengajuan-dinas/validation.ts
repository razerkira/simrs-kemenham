// src/app/(dashboard)/pengajuan-dinas/validation.ts
import { z } from 'zod';

// --- TAMBAHAN BARU: Aturan Validasi File ---
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg', // .jpg, .jpeg
  'image/png', // .png
  'image/webp' // .webp
];
// --- SELESAI TAMBAHAN ---

export const dinasSchema = z.object({
  deskripsi_kegiatan: z.string()
    .min(10, "Deskripsi kegiatan harus diisi (minimal 10 karakter)."),
  
  tgl_mulai: z.date({
    required_error: "Tanggal & jam mulai harus diisi.",
  }),
  
  tgl_selesai: z.date({
    required_error: "Tanggal & jam selesai harus diisi.",
  }),

  // --- TAMBAHAN BARU: Field 'dokumen' ---
  dokumen: z.instanceof(File)
    .optional() // Opsional
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE_BYTES, // Cek ukuran
      `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`
    )
    .refine(
      (file) => !file || ALLOWED_MIME_TYPES.includes(file.type), // Cek tipe
      "Format file tidak didukung. (Hanya PDF, DOC, JPG, PNG, WEBP)"
    ),
  // --- SELESAI TAMBAHAN ---

}).refine(data => data.tgl_selesai > data.tgl_mulai, {
  message: "Waktu selesai harus setelah waktu mulai",
  path: ["tgl_selesai"], 
});