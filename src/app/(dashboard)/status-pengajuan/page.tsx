// src/app/(dashboard)/status-pengajuan/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PengajuanCuti, PengajuanDinas } from "@/types/database";
import StatusTable from "./status-table";

async function getRiwayatCuti(userId: string): Promise<PengajuanCuti[]> {
  const supabase = createClient();
  const { data, error } = await (
    await supabase
  )
    .from("pengajuan_cuti")
    .select(
      `
      *, 
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching riwayat cuti:", error);
    return [];
  }
  return data;
}

async function getRiwayatDinas(userId: string): Promise<PengajuanDinas[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pengajuan_dinas")
    .select(
      `
      *, 
      dokumen_pendukung (
        id,
        nama_file,
        storage_path
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching riwayat dinas:", error);
    return [];
  }
  return data;
}

export default async function StatusPengajuanPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }
  const dataCuti = await getRiwayatCuti(session.user.id);
  const dataDinas = await getRiwayatDinas(session.user.id);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold">Status Pengajuan Saya</h1>
      <p className="mb-8 text-gray-600">
        Pantau status semua pengajuan cuti dan dinas Anda di halaman ini.
      </p>

      <StatusTable dataCuti={dataCuti} dataDinas={dataDinas} />
    </div>
  );
}
