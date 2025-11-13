import { z } from "zod";

export const pegawaiSchema = z.object({
  nip: z.string().min(1, { message: "NIP wajib diisi" }),
  nama: z.string().min(1, { message: "Nama wajib diisi" }),
  jabatan: z.string().min(1, { message: "Jabatan wajib diisi" }),
  email: z.string().email({ message: "Email tidak valid" }),
  no_hp: z.string().min(1, { message: "No HP wajib diisi" }),
  instansi_id: z.number().min(1, { message: "Instansi wajib dipilih" }),
  unit_id: z.number().min(1, { message: "Unit Kerja wajib dipilih" }),
  status_aktif: z.enum(["0", "1"]),
});
