// src/app/(dashboard)/pengajuan-dinas/validation.ts
import { z } from "zod";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const dinasSchema = z
  .object({
    deskripsi_kegiatan: z
      .string()
      .min(10, "Deskripsi kegiatan harus diisi (minimal 10 karakter)."),

    tgl_mulai: z.date(),
    tgl_selesai: z.date(),

    dokumen: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
        `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`
      )
      .refine(
        (file) => !file || ALLOWED_MIME_TYPES.includes(file.type),
        "Format file tidak didukung. (Hanya PDF, DOC, JPG, PNG, WEBP)"
      ),
  })
  .refine(
    (data) => {
      if (!data.tgl_mulai || !data.tgl_selesai) return true;
      return data.tgl_selesai > data.tgl_mulai;
    },
    {
      message: "Waktu selesai harus setelah waktu mulai",
      path: ["tgl_selesai"],
    }
  );

export type DinasFormValues = z.infer<typeof dinasSchema>;
