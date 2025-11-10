// src/app/(dashboard)/persetujuan/cuti/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PengajuanCutiWithProfile } from "@/types/database";

import PersetujuanCutiTable from "./persetujuan-cuti-table";

async function getPengajuanCutiUntukDisetujui(): Promise<
  PengajuanCutiWithProfile[]
> {
  const supabase = await createClient();

  const { data, error } = await (
    await supabase
  )
    .from("pengajuan_cuti")

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

    .eq("status", "menunggu_persetujuan")

    .order("created_at", { ascending: true });

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

      <PersetujuanCutiTable dataPengajuan={dataPengajuan} />
    </div>
  );
}
