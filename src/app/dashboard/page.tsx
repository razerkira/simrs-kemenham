"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  FileText,
  PlaneTakeoff,
  FileClock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import Calendar from "../(cuti)/(dash)/dummy-dashboard/calendar";

// Fungsi konversi tanggal ke zona WIB (GMT+7)
const toWIB = (dateStr: string) => {
  const utc = new Date(dateStr + " UTC");
  return new Date(utc.getTime() + 7 * 60 * 60 * 1000);
};

// Dapatkan tanggal hari ini (WIB) dalam format YYYY-MM-DD
const todayWIB = new Date(Date.now() + 7 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // ✅ 1. Fetch Kalender (cuti & dinas)
  const { data: kalenderData, isLoading: isKalenderLoading } = useQuery({
    queryKey: ["kalender"],
    queryFn: async () => {
      const res = await api.get("/api/v1/kalender");
      return res.data.data;
    },
  });

  // ✅ 2. Fetch Statistik
  const { data: statistikData, isLoading: isStatLoading } = useQuery({
    queryKey: ["statistik"],
    queryFn: async () => {
      const res = await api.get("/api/v1/statistik");
      return res.data;
    },
    refetchInterval: 10000, // 10 detik
  });

  // ✅ 3. Format statistik
  const dummyStats = useMemo(() => {
    const total =
      statistikData?.reduce((sum: number, s: any) => sum + s.total, 0) || 0;
    const menunggu =
      statistikData
        ?.filter((s: any) => s.status === "Diajukan")
        .reduce((sum: number, s: any) => sum + s.total, 0) || 0;
    const disetujui =
      statistikData
        ?.filter((s: any) => s.status === "Disetujui")
        .reduce((sum: number, s: any) => sum + s.total, 0) || 0;
    const ditolak =
      statistikData
        ?.filter((s: any) => s.status === "Ditolak")
        .reduce((sum: number, s: any) => sum + s.total, 0) || 0;
    return { total, menunggu, disetujui, ditolak };
  }, [statistikData]);

  // ✅ 4. Filter data hari ini (WIB)
  const todayCuti = useMemo(() => {
    if (!kalenderData) return [];
    return kalenderData.filter((item: any) => {
      const start = toWIB(item.start).toISOString().split("T")[0];
      const end = toWIB(item.end).toISOString().split("T")[0];
      return todayWIB >= start && todayWIB <= end && item.type === "cuti";
    });
  }, [kalenderData]);

  const todayDinas = useMemo(() => {
    if (!kalenderData) return [];
    return kalenderData.filter((item: any) => {
      const start = toWIB(item.start).toISOString().split("T")[0];
      const end = toWIB(item.end).toISOString().split("T")[0];
      return todayWIB >= start && todayWIB <= end && item.type === "dinas";
    });
  }, [kalenderData]);

  // ✅ 5. Ubah format untuk Calendar.tsx agar tetap kompatibel dengan UI lama
  const formattedSubmissions = useMemo(() => {
    if (!kalenderData) return [];
    return kalenderData.map((item: any) => ({
      id: String(item.id),
      jenis: item.type,
      nama: item.nama_pegawai,
      participants: item.type === "dinas" ? [{ nama: item.nama_pegawai }] : [],
      alasan: item.type === "cuti" ? item.title : undefined,
      kegiatan: item.type === "dinas" ? item.title : undefined,
      tanggalMulai: item.start.split(" ")[0],
      tanggalSelesai: item.end.split(" ")[0],
      status:
        item.status.toLowerCase() === "diajukan"
          ? "pending"
          : item.status.toLowerCase(),
    }));
  }, [kalenderData]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="p-6 space-y-6 w-full">
        {/* Row cards: Cuti & Dinas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Pegawai Cuti Hari Ini (
                {isKalenderLoading ? "..." : todayCuti.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {isKalenderLoading ? (
                <p className="text-gray-400 text-sm">Memuat data...</p>
              ) : todayCuti.length === 0 ? (
                <p className="text-gray-400 text-sm">Tidak ada pegawai cuti.</p>
              ) : (
                todayCuti.map((p: any) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.nama_pegawai}</span>
                    <span className="text-sm text-gray-500">{p.title}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlaneTakeoff className="h-5 w-5" /> Pegawai Dinas Hari Ini (
                {isKalenderLoading ? "..." : todayDinas.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {isKalenderLoading ? (
                <p className="text-gray-400 text-sm">Memuat data...</p>
              ) : todayDinas.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Tidak ada pegawai dinas.
                </p>
              ) : (
                todayDinas.map((p: any) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.nama_pegawai}</span>
                    <span className="text-sm text-gray-500">{p.title}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row stats card */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between">
              <FileText className="h-6 w-6" />
              <div className="text-right">
                <div className="text-xl font-bold">
                  {isStatLoading ? "..." : dummyStats.total}
                </div>
                <div className="text-sm text-gray-500">Total Pengajuan</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <FileClock className="h-6 w-6" />
              <div className="text-right">
                <div className="text-xl font-bold">
                  {isStatLoading ? "..." : dummyStats.menunggu}
                </div>
                <div className="text-sm text-gray-500">Menunggu</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <CheckCircle className="h-6 w-6" />
              <div className="text-right">
                <div className="text-xl font-bold">
                  {isStatLoading ? "..." : dummyStats.disetujui}
                </div>
                <div className="text-sm text-gray-500">Disetujui</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <XCircle className="h-6 w-6" />
              <div className="text-right">
                <div className="text-xl font-bold">
                  {isStatLoading ? "..." : dummyStats.ditolak}
                </div>
                <div className="text-sm text-gray-500">Ditolak</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Calendar submissions={formattedSubmissions} />
      </main>
    </div>
  );
}
