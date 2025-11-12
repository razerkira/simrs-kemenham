"use client";

import React, { useState } from "react";
import { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  PlaneTakeoff,
  FileClock,
  FileCheck,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";

import Header from "@/app/dashboard/_components/header";
import Sidebar from "@/app/dashboard/_components/sidebar";
import Calendar from "./calendar";

// Dummy profile
const dummyProfile: Profile = {
  id: "1",
  nama: "Kasubag TU",
  name: "Kasubag TU",
  email: "kasubag@example.com",
  role: "admin",
  created_at: "2025-07-08",
  nip: "12345",
  jabatan: "KASUBAG TU",
  pangkat_golongan: "IV A",
  unit_kerja: "SDM",
  jenis_kelamin: "pria",
};

// Dummy cuti/dinas
// Dummy data cuti dan dinas
const dummyCutiToday: any = [
  {
    id: "1",
    jenis: "cuti",
    nama: "Andi",
    alasan: "Sakit",
    tanggalMulai: "2025-11-06",
    tanggalSelesai: "2025-11-08", // cuti 3 hari
    status: "approved",
  },
  {
    id: "2",
    jenis: "cuti",
    nama: "Budi",
    alasan: "Cuti Tahunan",
    tanggalMulai: "2025-11-06",
    tanggalSelesai: "2025-11-06",
    status: "pending",
  },
];

const dummyDinasToday: any = [
  {
    id: "3",
    jenis: "dinas",
    participants: [{ nama: "Siti" }],
    kegiatan: "Rapat Kantor Luar",
    tipe: "Full",
    tanggalMulai: "2025-11-06",
    tanggalSelesai: "2025-11-06",
    status: "approved",
  },
  {
    id: "4",
    jenis: "dinas",
    participants: [{ nama: "Rina" }],
    kegiatan: "Survey Lokasi",
    tipe: "Half",
    tanggalMulai: "2025-11-07",
    tanggalSelesai: "2025-11-08",
    status: "pending",
  },
];

// Gabungkan semua untuk Calendar
const allSubmissions = [...dummyCutiToday, ...dummyDinasToday];

const dummyStats = { total: 50, menunggu: 10, disetujui: 30, ditolak: 10 };

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        profile={dummyProfile}
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header profile={dummyProfile} toggleSidebar={toggleSidebar} />

        <main className="p-6 space-y-6">
          {/* Row cards: Cuti & Dinas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Pegawai Cuti Hari Ini (
                  {dummyCutiToday.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {dummyCutiToday.map((p: any) => (
                  <div key={p.id} className="flex justify-between">
                    <span>{p.nama}</span>
                    <span className="text-sm text-gray-500">{p.alasan}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlaneTakeoff className="h-5 w-5" /> Pegawai Dinas Hari Ini (
                  {dummyDinasToday.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {dummyDinasToday.map((p: any) => (
                  <div key={p.id} className="flex justify-between">
                    <span>
                      {p.participants
                        ?.map((pp: { nama: any }) => pp.nama)
                        .join(",")}
                    </span>
                    <span className="text-sm text-gray-500">{p.kegiatan}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row stats card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center justify-between">
                <FileText className="h-6 w-6" />
                <div className="text-right">
                  <div className="text-xl font-bold">{dummyStats.total}</div>
                  <div className="text-sm text-gray-500">Total Pengajuan</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between">
                <FileClock className="h-6 w-6" />
                <div className="text-right">
                  <div className="text-xl font-bold">{dummyStats.menunggu}</div>
                  <div className="text-sm text-gray-500">Menunggu</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between">
                <CheckCircle className="h-6 w-6" />
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {dummyStats.disetujui}
                  </div>
                  <div className="text-sm text-gray-500">Disetujui</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between">
                <XCircle className="h-6 w-6" />
                <div className="text-right">
                  <div className="text-xl font-bold">{dummyStats.ditolak}</div>
                  <div className="text-sm text-gray-500">Ditolak</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <Calendar submissions={allSubmissions} />
        </main>
      </div>
    </div>
  );
}
