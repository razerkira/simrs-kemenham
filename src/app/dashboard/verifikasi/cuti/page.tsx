// src/app/(dashboard)/verifikasi/cuti/page.tsx

import { PengajuanCutiWithProfile } from "@/types/database"; // Tipe gabungan
import VerifikasiCutiTable from "./verifikasi-cuti-table"; // Tabel (Client)

// Fungsi untuk mengambil data pengajuan cuti yang MASUK
export default async function VerifikasiCutiPage() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Verifikasi Pengajuan Cuti</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan proses pengajuan cuti yang masuk dari para pegawai.
      </p>

      {/* Kita kirim data gabungan ke komponen Client */}
      <VerifikasiCutiTable />
    </div>
  );
}
