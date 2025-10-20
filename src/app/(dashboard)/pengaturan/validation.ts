import { z } from 'zod';

export const profileSchema = z.object({
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter").or(z.literal("")).optional(),
  jabatan: z.string().min(3, "Jabatan minimal 3 karakter").or(z.literal("")).optional(),
  pangkat_golongan: z.string().min(3, "Pangkat/Golongan minimal 3 karakter").or(z.literal("")).optional(),
  unit_kerja: z.string().min(3, "Unit kerja minimal 3 karakter").or(z.literal("")).optional(),
  jenis_kelamin: z.enum(['pria', 'wanita'], {
    required_error: "Jenis kelamin harus dipilih.",
    invalid_type_error: "Jenis kelamin tidak valid.",
  }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;