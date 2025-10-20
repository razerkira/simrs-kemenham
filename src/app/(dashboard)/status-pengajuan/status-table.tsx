// src/app/(dashboard)/status-pengajuan/status-table.tsx
"use client"

// --- TAMBAHAN BARU ---
import { useState } from 'react'
import { PengajuanCuti, PengajuanDinas, PengajuanStatus } from '@/types/database'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
// --- IMPOR KOMPONEN DIALOG BARU KITA ---
import DialogStatusDetail from './dialog-status-detail'

// Tipe data gabungan untuk state detail
type PengajuanDetail = PengajuanCuti | PengajuanDinas;

// Tipe data untuk props (tidak berubah)
interface StatusTableProps {
  dataCuti: PengajuanCuti[]
  dataDinas: PengajuanDinas[]
}

// ===============================================================
// Komponen Bantuan (Helper) untuk Badge Status (Tidak berubah)
// ===============================================================
function StatusBadge({ status }: { status: PengajuanStatus }) {
  const getStatusText = (status: PengajuanStatus): string => {
    switch (status) {
      case 'menunggu_verifikasi': return 'Menunggu Verifikasi'
      case 'ditolak_verifikator': return 'Ditolak Verifikator'
      case 'menunggu_persetujuan': return 'Menunggu Persetujuan'
      case 'ditolak_supervisor': return 'Ditolak Supervisor'
      case 'disetujui': return 'Disetujui'
      default: return 'Status Tidak Dikenal'
    }
  }
  const getVariant = (
    status: PengajuanStatus
  ): "warning" | "destructive" | "success" | "secondary" => {
    switch (status) {
      case 'menunggu_verifikasi': return 'warning'
      case 'menunggu_persetujuan': return 'secondary'
      case 'disetujui': return 'success'
      case 'ditolak_verifikator': return 'destructive'
      case 'ditolak_supervisor': return 'destructive'
      default: 'secondary'
    }
  }
  return <Badge variant={getVariant(status)}>{getStatusText(status)}</Badge>
}
// ===============================================================

// ===============================================================
// Komponen Utama
// ===============================================================
export default function StatusTable({ dataCuti, dataDinas }: StatusTableProps) {
  
  // --- STATE BARU UNTUK DIALOG DETAIL ---
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<PengajuanDetail | null>(null)

  // Helper format HANYA TANGGAL (tidak berubah)
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "dd MMMM yyyy", { locale: localeID })
  }

  // Helper format TANGGAL & JAM (tidak berubah)
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: localeID })
  }

  // Fungsi untuk membuka dialog detail
  const handleOpenDetail = (pengajuan: PengajuanDetail) => {
    setSelectedDetail(pengajuan);
    setIsDetailOpen(true);
  }
  // --- SELESAI STATE BARU ---

  return (
    <div className="space-y-8">
    
      {/* Tabel 1: Riwayat Pengajuan Cuti */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Cuti</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {dataCuti.length === 0 
                ? "Anda belum memiliki riwayat pengajuan cuti." 
                : "Klik baris untuk melihat detail pengajuan cuti Anda." // <-- Ubah caption
              }
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal Pengajuan</TableHead>
                <TableHead>Jenis / Alasan Cuti</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataCuti.map((cuti) => (
                // --- UBAH <TableRow>: Tambahkan onClick dan styling ---
                <TableRow 
                  key={cuti.id} 
                  onClick={() => handleOpenDetail(cuti)}
                  className="cursor-pointer hover:bg-muted/50" // <-- Styling
                >
                  <TableCell>{formatDate(cuti.created_at)}</TableCell>
                  <TableCell className="font-medium">{cuti.jenis_cuti}</TableCell>
                  <TableCell>{formatDate(cuti.tgl_mulai)}</TableCell>
                  <TableCell>{formatDate(cuti.tgl_selesai)}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={cuti.status} />
                  </TableCell>
                </TableRow>
                // --- SELESAI UBAH <TableRow> ---
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabel 2: Riwayat Pengajuan Dinas */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengajuan Dinas Luar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {dataDinas.length === 0 
                ? "Anda belum memiliki riwayat pengajuan dinas." 
                : "Klik baris untuk melihat detail pengajuan dinas Anda." // <-- Ubah caption
              }
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal Pengajuan</TableHead>
                <TableHead>Deskripsi Kegiatan</TableHead>
                <TableHead>Waktu Mulai</TableHead>
                <TableHead>Waktu Selesai</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataDinas.map((dinas) => (
                // --- UBAH <TableRow>: Tambahkan onClick dan styling ---
                <TableRow 
                  key={dinas.id}
                  onClick={() => handleOpenDetail(dinas)}
                  className="cursor-pointer hover:bg-muted/50" // <-- Styling
                >
                  <TableCell>{formatDate(dinas.created_at)}</TableCell>
                  <TableCell className="font-medium">{dinas.deskripsi_kegiatan}</TableCell>
                  <TableCell>{formatDateTime(dinas.tgl_mulai)}</TableCell>
                  <TableCell>{formatDateTime(dinas.tgl_selesai)}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={dinas.status} />
                  </TableCell>
                </TableRow>
                // --- SELESAI UBAH <TableRow> ---
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* --- TAMBAHKAN KOMPONEN DIALOG DETAIL DI SINI --- */}
      <DialogStatusDetail
        pengajuan={selectedDetail}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      {/* --- SELESAI TAMBAHAN DIALOG --- */}
    </div> 
  )
}