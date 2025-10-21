// src/app/(dashboard)/persetujuan/dinas/dialog-persetujuan-dinas.tsx
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PengajuanDinasWithProfile } from '@/types/database' // Tipe data 'Dinas'
import { prosesPersetujuanDinas,} from './actions' // Action 'Persetujuan Dinas'
import { PersetujuanFormState } from './types'
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client'
import { Download, FileText, CalendarDays, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Tipe data untuk props
interface DialogPersetujuanDinasProps {
  pengajuan: PengajuanDinasWithProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper format TANGGAL & JAM
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: localeID })
}

export default function DialogPersetujuanDinas({ 
  pengajuan, 
  open, 
  onOpenChange 
}: DialogPersetujuanDinasProps) {
  
  const [catatan, setCatatan] = useState("") // Catatan SUPERVISOR
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  if (!pengajuan) return null

  const dokumen = pengajuan.dokumen_pendukung?.[0]

  // Fungsi untuk download file (sama)
  const handleDownload = async () => {
    if (!dokumen) return;
    
    startTransition(async () => {
      const { data, error } = await supabase.storage
        .from('dokumen_pengajuan')
        .createSignedUrl(dokumen.storage_path, 60) 
      
      if (error) {
        toast.error("Gagal membuat link download.")
        return
      }
      window.open(data.signedUrl, '_blank')
    })
  }

  // Fungsi untuk memanggil server action (Setuju / Tolak)
  const handleSubmit = (aksi: 'setuju' | 'tolak') => {
    startTransition(async () => {
      // --- UBAH: Panggil action 'Persetujuan Dinas' ---
      const result = await prosesPersetujuanDinas({
        pengajuanId: pengajuan.id,
        catatan: catatan,
        aksi: aksi
      })
      
      if (result.success) {
        toast.success(result.message)
        onOpenChange(false) // Tutup dialog
        setCatatan("") // Kosongkan catatan
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          {/* --- UBAH: Judul --- */}
          <DialogTitle>Beri Persetujuan Akhir Dinas</DialogTitle>
          <DialogDescription>
            Tinjau detail dan catatan verifikator sebelum memberi keputusan final.
          </DialogDescription>
        </DialogHeader>
        
        {/* Konten Detail Pengajuan */}
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Info Pegawai (Sama) */}
          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-semibold">Data Pegawai</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Nama</span>
              <span className="col-span-2 font-medium">{pengajuan.profiles?.nama ?? 'N/A'}</span>
              <span className="text-gray-500">NIP</span>
              <span className="col-span-2">{pengajuan.profiles?.nip ?? 'N/A'}</span>
            </div>
          </div>
          
          {/* --- UBAH: Info Dinas --- */}
          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-semibold">Data Dinas Luar</h4>
            <div className="space-y-2 text-sm">
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
            </div>
            {/* --- SELESAI UBAH --- */}
            
            {/* Tombol Download Dokumen (Sama) */}
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
          
          {/* Catatan Verifikator (Sama) */}
          <div className="rounded-md border bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-gray-600" />
              Catatan dari Verifikator
            </h4>
            <p className="text-sm italic text-gray-700">
              {pengajuan.catatan_verifikator || "Tidak ada catatan."}
            </p>
          </div>
          
          {/* Form Aksi Supervisor (Sama) */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="catatan-supervisor">Catatan Anda (Supervisor)</Label>
            <Textarea
              id="catatan-supervisor"
              placeholder="Berikan catatan persetujuan akhir atau alasan penolakan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Footer Tombol (Sama) */}
        <DialogFooter className="gap-2 pt-4 sm:justify-between">
          <DialogClose asChild>
            <Button variant="ghost">Batal</Button>
          </DialogClose>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleSubmit('tolak')}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Tolak Pengajuan"}
            </Button>
            <Button 
              onClick={() => handleSubmit('setuju')}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Setujui Pengajuan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}