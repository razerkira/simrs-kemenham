// src/app/(dashboard)/persetujuan/dinas/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { PengajuanDinasWithProfile } from "@/types/database";

import PersetujuanDinasTable from "./persetujuan-dinas-table";

async function getPengajuanDinasUntukDisetujui(): Promise<
  PengajuanDinasWithProfile[]
> {
  const supabase = createClient();

  const { data, error } = await (
    await supabase
  )
    .from("pengajuan_dinas")

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
    console.error("Error fetching pengajuan dinas untuk persetujuan:", error);
    return [];
  }

  return data as PengajuanDinasWithProfile[];
}

export default async function PersetujuanDinasPage() {
  const dataPengajuan = await getPengajuanDinasUntukDisetujui();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Persetujuan Akhir Dinas</h1>
      <p className="mb-8 text-gray-600">
        Tinjau dan berikan persetujuan akhir untuk pengajuan dinas luar di bawah
        ini.
      </p>

      <PersetujuanDinasTable dataPengajuan={dataPengajuan} />
    </div>
  );
}
