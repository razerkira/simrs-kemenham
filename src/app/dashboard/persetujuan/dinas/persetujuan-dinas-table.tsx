// src/app/(dashboard)/persetujuan/dinas/persetujuan-dinas-table.tsx
"use client";

import { useState } from "react";
import { PengajuanDinasWithProfile, PengajuanStatus } from "@/types/database";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DialogPersetujuanDinas from "./dialog-persetujuan-dinas";

interface PersetujuanDinasTableProps {
  dataPengajuan: PengajuanDinasWithProfile[];
}

function StatusBadge({ status }: { status: PengajuanStatus }) {
  const getStatusText = (status: PengajuanStatus): string => {
    switch (status) {
      case "menunggu_verifikasi":
        return "Menunggu Verifikasi";
      case "ditolak_verifikator":
        return "Ditolak Verifikator";
      case "menunggu_persetujuan":
        return "Menunggu Persetujuan";
      case "ditolak_supervisor":
        return "Ditolak Supervisor";
      case "disetujui":
        return "Disetujui";
      default:
        return "Status Tidak Dikenal";
    }
  };

  const getVariant = (
    status: PengajuanStatus
  ): "warning" | "destructive" | "success" | "secondary" => {
    switch (status) {
      case "menunggu_verifikasi":
        return "warning";
      case "menunggu_persetujuan":
        return "secondary";
      case "disetujui":
        return "success";
      case "ditolak_verifikator":
        return "destructive";
      case "ditolak_supervisor":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getVariant(status)}>{getStatusText(status)}</Badge>;
}

export default function PersetujuanDinasTable({
  dataPengajuan,
}: PersetujuanDinasTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<PengajuanDinasWithProfile | null>(null);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: localeID });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
      locale: localeID,
    });
  };

  const handleOpenDialog = (pengajuan: PengajuanDinasWithProfile) => {
    setSelectedPengajuan(pengajuan);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pengajuan untuk Persetujuan</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {dataPengajuan.length === 0
              ? "Tidak ada pengajuan dinas yang perlu disetujui."
              : "Daftar pengajuan dinas yang menunggu persetujuan akhir."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pegawai</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Tanggal Pengajuan</TableHead>
              <TableHead>Deskripsi Kegiatan</TableHead>
              <TableHead>Waktu Mulai</TableHead>
              <TableHead>Waktu Selesai</TableHead>
              <TableHead>Catatan Verifikator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPengajuan.map((pengajuan) => (
              <TableRow key={pengajuan.id}>
                <TableCell className="font-medium">
                  {pengajuan.profiles?.nama ?? "N/A"}
                </TableCell>
                <TableCell>{pengajuan.profiles?.nip ?? "N/A"}</TableCell>
                <TableCell>{formatDate(pengajuan.created_at)}</TableCell>
                <TableCell>{pengajuan.deskripsi_kegiatan}</TableCell>
                <TableCell>{formatDateTime(pengajuan.tgl_mulai)}</TableCell>
                <TableCell>{formatDateTime(pengajuan.tgl_selesai)}</TableCell>
                <TableCell className="italic text-gray-600">
                  {pengajuan.catatan_verifikator || "-"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={pengajuan.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDialog(pengajuan)} // Tambahkan onClick
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DialogPersetujuanDinas
          pengajuan={selectedPengajuan}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
