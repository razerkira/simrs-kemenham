// src/types/database.ts

// Ini adalah Tipe Enum yang kita buat di Supabase
export type UserRole = "admin" | "verificator" | "supervisor" | "pegawai";
export type JenisKelamin = "pria" | "wanita";

// Ini adalah Tipe untuk tabel 'profiles'
export type Profile = {
  id: string; // uuid
  created_at: string; // timestampz
  nip: string | null;
  nama: string | null;
  email: string | null;
  jabatan: string | null;
  pangkat_golongan: string | null;
  unit_kerja: string | null;
  jenis_kelamin: JenisKelamin | null;
  role: UserRole | null;
};

export type PengajuanStatus =
  | "menunggu_verifikasi"
  | "ditolak_verifikator"
  | "menunggu_persetujuan"
  | "ditolak_supervisor"
  | "disetujui";

  export type PengajuanCuti = {
  id: string // uuid
  user_id: string // uuid
  jenis_cuti: string
  tgl_mulai: string // 'date' akan dibaca sebagai string
  tgl_selesai: string // 'date' akan dibaca sebagai string
  status: PengajuanStatus
  catatan_verifikator: string | null
  verifikator_id: string | null
  catatan_supervisor: string | null
  supervisor_id: string | null
  created_at: string // timestampz
  dokumen_pendukung: DokumenPendukung[]
}

export type PengajuanDinas = {
  id: string // uuid
  user_id: string // uuid
  deskripsi_kegiatan: string
  tgl_mulai: string // 'timestampz' akan dibaca sebagai string
  tgl_selesai: string // 'timestampz' akan dibaca sebagai string
  status: PengajuanStatus // Pakai Tipe Enum yang sama
  catatan_verifikator: string | null
  verifikator_id: string | null
  catatan_supervisor: string | null
  supervisor_id: string | null
  created_at: string // timestampz
  dokumen_pendukung: DokumenPendukung[]
}

export type PengajuanCutiWithProfile = PengajuanCuti & {
  profiles: Pick<Profile, 'nama' | 'nip' | 'unit_kerja'> | null
  // Sebuah pengajuan bisa punya BANYAK dokumen (meski sekarang baru 1)
  // Jadi kita jadikan array '[]'
  dokumen_pendukung: DokumenPendukung[] 
}

export type DokumenPendukung = {
  id: string
  pengajuan_dinas_id: string | null
  pengajuan_cuti_id: string | null
  nama_file: string
  storage_path: string
  tipe_file: string
  uploaded_at: string
}

// Tipe data gabungan untuk Dinas + Profil Pegawai + Dokumen
export type PengajuanDinasWithProfile = PengajuanDinas & {
  profiles: Pick<Profile, 'nama' | 'nip' | 'unit_kerja'> | null
  dokumen_pendukung: DokumenPendukung[] 
}


// Catatan:
// Kita akan tambahkan tipe untuk 'pengajuan_cuti' dll di file ini nanti
// saat kita membutuhkannya.
