// src/app/(dashboard)/admin/manajemen-pegawai/validation.ts
import { z } from 'zod';

// Skema untuk mengedit profil pegawai oleh Admin
export const editProfileSchema = z.object({
  id: z.string().uuid("ID Pegawai tidak valid"), 
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nip: z.string().min(5, "NIP minimal 5 karakter"), 
  jabatan: z.string().min(3, "Jabatan minimal 3 karakter"),
  pangkat_golongan: z.string().min(3, "Pangkat/Golongan minimal 3 karakter"),
  unit_kerja: z.string().min(3, "Unit kerja minimal 3 karakter"),
  role: z.enum(['admin', 'verificator', 'supervisor', 'pegawai']), 

  // --- TAMBAHAN BARU: Password Baru (Opsional) ---
  passwordBaru: z.string()
    .optional() // Boleh kosong
    // Jika diisi (bukan string kosong), harus minimal 8 karakter
    .refine((val) => !val || val.length >= 8, { 
      message: "Password baru minimal 8 karakter jika diisi.",
    }),
  // --- SELESAI TAMBAHAN ---
});