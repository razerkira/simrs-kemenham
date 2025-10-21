// src/app/(dashboard)/pengajuan-cuti/validation.ts
import { z } from 'zod';

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

// --- ADD 'export' HERE ---
export const cutiSchema = z.object({
  jenis_cuti: z.string()
    .min(5, "Jenis cuti atau alasan harus diisi (minimal 5 karakter)."),

  tgl_mulai: z.date(),
  tgl_selesai: z.date(),

  dokumen: z.instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
      `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`
    )
    .refine(
      (file) => !file || ALLOWED_MIME_TYPES.includes(file.type),
      "Format file tidak didukung. (Hanya PDF, DOC, JPG, PNG, WEBP)"
    )

}).refine(data => {
    if (!data.tgl_mulai || !data.tgl_selesai) return true;
    return data.tgl_selesai >= data.tgl_mulai;
  }, {
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  path: ["tgl_selesai"],
});

// Optional: Export type if needed elsewhere
export type CutiFormValues = z.infer<typeof cutiSchema>;