// src/types/database.ts

export type UserRole = "admin" | "verificator" | "supervisor" | "pegawai";
export type JenisKelamin = "pria" | "wanita";

export type Profile = {
  id: string;
  created_at: string;
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
  id: string;
  user_id: string;
  jenis_cuti: string;
  tgl_mulai: string;
  tgl_selesai: string;
  status: PengajuanStatus;
  catatan_verifikator: string | null;
  verifikator_id: string | null;
  catatan_supervisor: string | null;
  supervisor_id: string | null;
  created_at: string;
  dokumen_pendukung: DokumenPendukung[];
};

export type PengajuanDinas = {
  id: string;
  user_id: string;
  deskripsi_kegiatan: string;
  tgl_mulai: string;
  tgl_selesai: string;
  status: PengajuanStatus;
  catatan_verifikator: string | null;
  verifikator_id: string | null;
  catatan_supervisor: string | null;
  supervisor_id: string | null;
  created_at: string;
  dokumen_pendukung: DokumenPendukung[];
};

export type PengajuanCutiWithProfile = PengajuanCuti & {
  profiles: Pick<Profile, "nama" | "nip" | "unit_kerja"> | null;
  dokumen_pendukung: DokumenPendukung[];
};

export type DokumenPendukung = {
  id: string;
  pengajuan_dinas_id: string | null;
  pengajuan_cuti_id: string | null;
  nama_file: string;
  storage_path: string;
  tipe_file: string;
  uploaded_at: string;
};

export type PengajuanDinasWithProfile = PengajuanDinas & {
  profiles: Pick<Profile, "nama" | "nip" | "unit_kerja"> | null;
  dokumen_pendukung: DokumenPendukung[];
};
