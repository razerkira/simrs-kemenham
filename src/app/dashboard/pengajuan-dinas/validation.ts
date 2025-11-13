import { z } from "zod";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const dinasSchema = z.object({
  pegawaiList: z
    .array(
      z.object({
        id: z.number().positive({ message: "Pegawai wajib dipilih." }),
        nip: z.string().optional(),
        nama: z.string().optional(),
      })
    )
    .min(1, { message: "Minimal satu pegawai harus dipilih." }),

  kegiatan: z
    .string()
    .min(1, { message: "Deskripsi kegiatan wajib diisi." })
    .max(500, { message: "Deskripsi kegiatan terlalu panjang." }),
 jenis: z
  .enum(["FULL", "HALF"])
  .refine((val) => val === "FULL" || val === "HALF", {
    message: "Jenis perjalanan wajib dipilih.",
  }),

  mulai: z
    .string()
    .min(1, { message: "Tanggal mulai wajib diisi." })
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "Format tanggal mulai tidak valid.",
    }),

  selesai: z
    .string()
    .min(1, { message: "Tanggal selesai wajib diisi." })
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "Format tanggal selesai tidak valid.",
    }),

  file: z
    .instanceof(File, { message: "Lampiran wajib diunggah." })
    .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
      message: `Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB.`,
    })
    .refine(
      (file) => ALLOWED_MIME_TYPES.includes(file.type),
      "Format file tidak didukung (PDF, JPG, PNG, WEBP)."
    ),
});

export type DinasFormValues = z.infer<typeof dinasSchema>;
