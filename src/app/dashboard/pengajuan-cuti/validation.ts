import { z } from "zod";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export const cutiSchema = z
  .object({
    jenis_cuti: z.string().min(1, "Jenis cuti harus dipilih."),
    tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi."),
    tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi."),
    alasan: z.string().min(5, "Keterangan minimal 5 karakter."),
    file: z
      .instanceof(File, { message: "Lampiran wajib diunggah." })
      .refine(
        (file) => !file || file.size <= MAX_FILE_SIZE_BYTES,
        `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`
      )
      .refine(
        (file) => !file || ALLOWED_MIME_TYPES.includes(file.type),
        "Format file tidak didukung. (Hanya PDF, JPG, PNG, WEBP)"
      ),
  })
  .refine(
    (data) => {
      if (!data.tanggal_mulai || !data.tanggal_selesai) return true;
      return new Date(data.tanggal_selesai) >= new Date(data.tanggal_mulai);
    },
    {
      message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
      path: ["tanggal_selesai"],
    }
  );

export type CutiFormValues = z.infer<typeof cutiSchema>;
