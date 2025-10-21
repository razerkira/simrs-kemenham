// src/app/(dashboard)/pengaturan/validation.ts
import { z } from 'zod';

export const profileSchema = z.object({
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter").or(z.literal("")).optional(),
  jabatan: z.string().min(3, "Jabatan minimal 3 karakter").or(z.literal("")).optional(),
  pangkat_golongan: z.string().min(3, "Pangkat/Golongan minimal 3 karakter").or(z.literal("")).optional(),
  unit_kerja: z.string().min(3, "Unit kerja minimal 3 karakter").or(z.literal("")).optional(),
  // --- CORRECTED ENUM DEFINITION ---
  // Remove the invalid options object
  jenis_kelamin: z.enum(['pria', 'wanita']),
  // --- END CORRECTION ---
});

// Ekspor tipe form
export type ProfileFormValues = z.infer<typeof profileSchema>;