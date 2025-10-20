// src/app/(dashboard)/persetujuan/cuti/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
// Kita pakai Tipe Gabungan yang sama
import { PengajuanCutiWithProfile } from "@/types/database";
// Kita akan buat tabel baru untuk persetujuan
import PersetujuanCutiTable from "./persetujuan-cuti-table";

// Fungsi untuk mengambil data pengajuan cuti yang perlu disetujui
async function getPengajuanCutiUntukDisetujui(): Promise<
  PengajuanCutiWithProfile[]
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pengajuan_cuti")
    // Query "Join" 3-tabel yang sama
    .select(
      `
      *, 
      profiles:user_id (
        nama, 
        nip, 
        unit_kerja
      ),
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `
    )
    // --- INI PERBEDAAN UTAMANYA ---
    .eq("status", "menunggu_persetujuan") // Hanya yang statusnya menunggu persetujuan
    // --- SELESAI PERBEDAAN ---
    .order("created_at", { ascending: true }); // Tampilkan yang paling lama dulu

  if (error) {
    console.error("Error fetching pengajuan cuti untuk persetujuan:", error);
    return [];
  }

  return data as PengajuanCutiWithProfile[];
}

export default async function PersetujuanCutiPage() {
  const dataPengajuan = await getPengajuanCutiUntukDisetujui();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Persetujuan Akhir Cuti</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan berikan persetujuan akhir untuk pengajuan cuti di bawah ini.
        /
      </p>

      {/* Kita kirim data ke komponen Client */}
      <PersetujuanCutiTable dataPengajuan={dataPengajuan} />
    </div>
  );
}
