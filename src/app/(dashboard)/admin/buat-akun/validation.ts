// src/app/(dashboard)/admin/buat-akun/validation.ts
import { z } from 'zod';

export const buatAkunSchema = z.object({
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter").or(z.literal("")).optional(),
  jabatan: z.string().min(3, "Jabatan minimal 3 karakter").or(z.literal("")).optional(),
  pangkat_golongan: z.string().min(3, "Pangkat/Golongan minimal 3 karakter").or(z.literal("")).optional(),
  unit_kerja: z.string().min(3, "Unit kerja minimal 3 karakter").or(z.literal("")).optional(),
  // --- CORRECTED ROLE DEFINITION ---
  // Remove the invalid options object
  role: z.enum(['admin', 'verificator', 'supervisor', 'pegawai']),
  // --- END CORRECTION ---
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type BuatAkunFormValues = z.infer<typeof buatAkunSchema>;