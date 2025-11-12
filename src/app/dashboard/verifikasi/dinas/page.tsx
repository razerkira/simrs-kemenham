// src/app/(dashboard)/verifikasi/dinas/page.tsx

// --- UBAH: Gunakan tipe data 'Dinas' yang baru ---
import { PengajuanDinasWithProfile } from "@/types/database";
// --- UBAH: Tunjuk ke tabel 'Dinas' ---
import VerifikasiDinasTable from "./verifikasi-dinas-table";

// Fungsi untuk mengambil data pengajuan dinas yang MASUK

export default async function VerifikasiDinasPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Verifikasi Pengajuan Dinas</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan proses pengajuan dinas luar yang masuk dari para pegawai.
      </p>

      {/* --- UBAH: Kirim ke komponen tabel 'Dinas' --- */}
      <VerifikasiDinasTable />
    </div>
  );
}
