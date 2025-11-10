// src/app/(dashboard)/verifikasi/cuti/dialog-verifikasi-cuti.tsx
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
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { PengajuanCutiWithProfile } from '@/types/database'
import { prosesVerifikasiCuti, VerifikasiFormState } from './actions'
import { toast } from "sonner"
import { createClient } from '@/utils/supabase/client' // Perhatikan: ini 'client'
import { Download, FileText, CalendarDays } from "lucide-react"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"

// Tipe data untuk props
interface DialogVerifikasiCutiProps {
  pengajuan: PengajuanCutiWithProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Helper format tanggal (copy-paste dari tabel)
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  return format(new Date(dateString), "dd MMMM yyyy", { locale: localeID })
}

export default function DialogVerifikasiCuti({ 
  pengajuan, 
  open, 
  onOpenChange 
}: DialogVerifikasiCutiProps) {
  
  const [catatan, setCatatan] = useState("")
  const [isPending, startTransition] = useTransition()
  const supabase = createClient() // Supabase client untuk download

  // Jika tidak ada data pengajuan, jangan render apa-apa
  if (!pengajuan) return null

  // Ambil dokumen pertama (jika ada)
  const dokumen = pengajuan.dokumen_pendukung?.[0]

  // Fungsi untuk download file aman dari bucket privat
  const handleDownload = async () => {
    if (!dokumen) return;
    
    startTransition(async () => {
      const { data, error } = await (await supabase).storage
        .from('dokumen_pengajuan')
        // Buat link download sementara (60 detik)
        .createSignedUrl(dokumen.storage_path, 60) 
      
      if (error) {
        toast.error("Gagal membuat link download.")
        return
      }
      // Buka link di tab baru
      window.open(data.signedUrl, '_blank')
    })
  }

  // Fungsi untuk memanggil server action (Setuju / Tolak)
  const handleSubmit = (aksi: 'setuju' | 'tolak') => {
    startTransition(async () => {
      const result = await prosesVerifikasiCuti({
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
          <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
          <DialogDescription>
            Tinjau detail pengajuan dari pegawai di bawah ini.
          </DialogDescription>
        </DialogHeader>
        
        {/* Konten Detail Pengajuan */}
        <div className="space-y-4 py-4">
          {/* Info Pegawai */}
          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-semibold">Data Pegawai</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Nama</span>
              <span className="col-span-2 font-medium">{pengajuan.profiles?.nama ?? 'N/A'}</span>
              
              <span className="text-gray-500">NIP</span>
              <span className="col-span-2">{pengajuan.profiles?.nip ?? 'N/A'}</span>
              
              <span className="text-gray-500">Unit Kerja</span>
              <span className="col-span-2">{pengajuan.profiles?.unit_kerja ?? 'N/A'}</span>
            </div>
          </div>
          
          {/* Info Cuti */}
          <div className="rounded-md border p-4">
            <h4 className="mb-2 font-semibold">Data Cuti</h4>
            <div className="space-y-2 text-sm">
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
            </div>
            
            {/* Tombol Download Dokumen (jika ada) */}
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
          
          {/* Form Aksi Verifikator */}
          <div className="space-y-2">
            <Label htmlFor="catatan-verifikator">Catatan Verifikator (Opsional)</Label>
            <Textarea
              id="catatan-verifikator"
              placeholder="Berikan catatan persetujuan atau alasan penolakan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
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
              {isPending ? "Memproses..." : "Setujui & Teruskan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}