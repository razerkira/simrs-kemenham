// src/app/(dashboard)/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ListChecks, PlaneTakeoff } from "lucide-react";

type AktivitasPegawai = {
  id: string;
  nama: string | null;
  keterangan: string; 
};

async function getCutiHariIni(): Promise<AktivitasPegawai[]> {
  const supabase = createClient();
  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();

  type CutiQueryResult = {
    id: string;
    jenis_cuti: string;
    profiles: { nama: string | null } | null; 
  };

  const { data, error } = await (
    await supabase
  )
    .from("pengajuan_cuti")
    .select(
      `
      id,
      jenis_cuti,
      profiles:user_id ( nama )
    `
    )
    .eq("status", "disetujui")
    .lte("tgl_mulai", startOfDay)
    .gte("tgl_selesai", startOfDay)
    .returns<CutiQueryResult[]>();

  if (error) {
    console.error("Error fetching cuti hari ini:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    nama: item.profiles?.nama ?? "N/A", 
    keterangan: item.jenis_cuti,
  }));
}

async function getDinasHariIni(): Promise<AktivitasPegawai[]> {
  const supabase = await createClient();
  const now = new Date().toISOString(); 

  type DinasQueryResult = {
    id: string;
    deskripsi_kegiatan: string;
    profiles: { nama: string | null } | null; 
  };
  

  const { data, error } = await (
    await supabase
  )
    .from("pengajuan_dinas")
    .select(
      `
      id,
      deskripsi_kegiatan,
      profiles:user_id ( nama )
    `
    )
    .eq("status", "disetujui")
    .lte("tgl_mulai", now)
    .gte("tgl_selesai", now)
    
    .returns<DinasQueryResult[]>();

  if (error) {
    console.error("Error fetching dinas hari ini:", error);
    return [];
  }

  
  return data.map((item) => ({
    id: item.id,
    nama: item.profiles?.nama ?? "N/A", 
    keterangan: item.deskripsi_kegiatan,
  }));
}

export default async function HomePage() {
 
  const pegawaiCuti = await getCutiHariIni();
  const pegawaiDinas = await getDinasHariIni();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Aktivitas Harian</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pegawai Cuti Hari Ini
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pegawaiCuti.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pegawaiCuti.map((pegawai) => (
                  <li key={pegawai.id} className="py-3">
                    <p className="font-medium">{pegawai.nama}</p>
                    <p className="text-sm text-gray-600">
                      {pegawai.keterangan}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada pegawai yang cuti hari ini.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pegawai Dinas Luar Hari Ini
            </CardTitle>
            <PlaneTakeoff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pegawaiDinas.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pegawaiDinas.map((pegawai) => (
                  <li key={pegawai.id} className="py-3">
                    <p className="font-medium">{pegawai.nama}</p>
                    <p className="text-sm text-gray-600">
                      {pegawai.keterangan}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada pegawai yang dinas luar hari ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
