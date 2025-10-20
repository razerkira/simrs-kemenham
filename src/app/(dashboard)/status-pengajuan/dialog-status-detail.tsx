// src/app/(dashboard)/status-pengajuan/dialog-status-detail.tsx
"use client"

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" // Kita butuh Badge lagi
import { PengajuanCuti, PengajuanDinas, PengajuanStatus } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { toast } from "sonner"
import { Download, FileText, CalendarDays, MessageSquare, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Tipe data gabungan untuk props, bisa Cuti atau Dinas
type PengajuanDetail = PengajuanCuti | PengajuanDinas;

interface DialogStatusDetailProps {
  pengajuan: PengajuanDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper format tanggal (reusable)
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd MMMM yyyy", { locale: localeID })
}

// Helper format tanggal & jam (reusable)
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: localeID })
}

// Helper Badge Status (reusable)
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

export default function DialogStatusDetail({
  pengajuan,
  open,
  onOpenChange
}: DialogStatusDetailProps) {
  
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  if (!pengajuan) return null

  // --- Cek Tipe Pengajuan ---
  // Kita bisa cek keberadaan field unik, misal 'jenis_cuti'
  const isCuti = 'jenis_cuti' in pengajuan;
  const isDinas = 'deskripsi_kegiatan' in pengajuan;
  // --- Selesai Cek Tipe ---

  const dokumen = pengajuan.dokumen_pendukung?.[0]

  // Fungsi download (sama)
  const handleDownload = async () => {
    if (!dokumen) return;
    startTransition(async () => {
      const { data, error } = await supabase.storage
        .from('dokumen_pengajuan')
        .createSignedUrl(dokumen.storage_path, 60)
      if (error) { toast.error("Gagal membuat link download."); return }
      window.open(data.signedUrl, '_blank')
    })
  }

  // Menentukan apakah ada catatan penolakan
  const isDitolak = pengajuan.status === 'ditolak_verifikator' || pengajuan.status === 'ditolak_supervisor';
  const catatanPenolakan = pengajuan.status === 'ditolak_verifikator'
    ? pengajuan.catatan_verifikator
    : pengajuan.catatan_supervisor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan {isCuti ? 'Cuti' : isDinas ? 'Dinas' : ''}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 pt-1">
            Status saat ini: <StatusBadge status={pengajuan.status} />
          </DialogDescription>
        </DialogHeader>

        {/* Konten Detail */}
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">

          {/* Info Utama (Cuti atau Dinas) */}
          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-semibold">Detail</h4>
            <div className="space-y-2 text-sm">
              {/* Tampilkan field Cuti */}
              {isCuti && (
                <>
                  <div className="flex items-start">
                    <FileText className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div>
                      <span className="font-medium">Jenis / Alasan Cuti</span>
                      <p className="text-gray-700">{pengajuan.jenis_cuti}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Tanggal:</span>
                    <span className="ml-2 text-gray-700">
                      {formatDate(pengajuan.tgl_mulai)} s/d {formatDate(pengajuan.tgl_selesai)}
                    </span>
                  </div>
                </>
              )}
              {/* Tampilkan field Dinas */}
              {isDinas && (
                <>
                  <div className="flex items-start">
                    <FileText className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-500" />
                    <div>
                      <span className="font-medium">Deskripsi Kegiatan</span>
                      <p className="text-gray-700">{pengajuan.deskripsi_kegiatan}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Waktu Mulai:</span>
                    <span className="ml-2 text-gray-700">
                      {formatDateTime(pengajuan.tgl_mulai)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Waktu Selesai:</span>
                    <span className="ml-2 text-gray-700">
                      {formatDateTime(pengajuan.tgl_selesai)}
                    </span>
                  </div>
                </>
              )}
               <div className="flex items-center pt-1">
                    <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="font-medium">Tanggal Diajukan:</span>
                    <span className="ml-2 text-gray-700">
                      {formatDate(pengajuan.created_at)}
                    </span>
                  </div>
            </div>
            {/* Tombol Download Dokumen */}
            {dokumen && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={handleDownload}
                disabled={isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                {dokumen.nama_file}
              </Button>
            )}
          </div>

          {/* Tampilkan Catatan Verifikator (jika sudah ada) */}
          {pengajuan.catatan_verifikator && (
            <div className="rounded-md border bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
                Catatan dari Verifikator
              </h4>
              <p className="text-sm italic text-gray-700">
                {pengajuan.catatan_verifikator}
              </p>
            </div>
          )}

          {/* Tampilkan Catatan Supervisor (jika sudah ada) */}
          {pengajuan.catatan_supervisor && (
            <div className="rounded-md border bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
                Catatan dari Supervisor
              </h4>
              <p className="text-sm italic text-gray-700">
                {pengajuan.catatan_supervisor}
              </p>
            </div>
          )}

          {/* Tampilkan Alasan Penolakan (jika ditolak) */}
          {isDitolak && catatanPenolakan && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <h4 className="mb-2 font-semibold flex items-center text-destructive">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alasan Penolakan
              </h4>
              <p className="text-sm italic text-destructive/90">
                {catatanPenolakan}
              </p>
            </div>
          )}

        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}