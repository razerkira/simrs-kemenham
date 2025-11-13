"use client";

import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCallback } from "react";

interface PengajuanCuti {
  id: number;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string;
  lampiran: string | null;
  status: string;
  created_at: string;
}

interface PengajuanDinas {
  id: number;
  tanggal_berangkat: string;
  tanggal_kembali: string;
  keterangan: string;
  lampiran: string | null;
  status: string;
  created_at: string;
}

type PengajuanDetail = PengajuanCuti | PengajuanDinas;

interface DialogStatusDetailProps {
  pengajuan: PengajuanDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DialogStatusDetail({
  pengajuan,
  open,
  onOpenChange,
}: DialogStatusDetailProps) {
  if (!pengajuan) return null;

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://simrs.idxpert.id";
  const isCuti = "jenis_cuti" in pengajuan;
  const isDinas = "tanggal_berangkat" in pengajuan;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: localeID });
    } catch {
      return "-";
    }
  };

  const handleOpenLampiran = useCallback(() => {
    if (!pengajuan.lampiran) {
      toast.error("Tidak ada lampiran untuk pengajuan ini");
      return;
    }

    const isFullUrl = pengajuan.lampiran.startsWith("http");
    const fileUrl = isFullUrl
      ? pengajuan.lampiran
      : `${baseURL}/storage/${pengajuan.lampiran}`;

    console.log("Buka lampiran:", fileUrl);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }, [pengajuan.lampiran, baseURL]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            Detail Pengajuan {isCuti ? "Cuti" : isDinas ? "Dinas" : ""}
          </DialogTitle>
          <DialogDescription>
            Status saat ini:{" "}
            <Badge
              variant={
                pengajuan.status.toLowerCase().includes("tolak")
                  ? "destructive"
                  : pengajuan.status.toLowerCase().includes("setuju")
                  ? "success"
                  : "warning"
              }
            >
              {pengajuan.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="rounded-md border p-4 space-y-2 text-sm">
            {isCuti && (
              <>
                <p>
                  <span className="font-medium">Jenis Cuti:</span>{" "}
                  {pengajuan.jenis_cuti}
                </p>
                <p>
                  <span className="font-medium">Alasan:</span>{" "}
                  {pengajuan.keterangan}
                </p>
                <p>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {formatDate(pengajuan.tanggal_mulai)} -{" "}
                  {formatDate(pengajuan.tanggal_selesai)}
                </p>
              </>
            )}

            {isDinas && (
              <>
                <p>
                  <span className="font-medium">Deskripsi Kegiatan:</span>{" "}
                  {pengajuan.keterangan}
                </p>
                <p>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {formatDate(pengajuan.tanggal_berangkat)} -{" "}
                  {formatDate(pengajuan.tanggal_kembali)}
                </p>
              </>
            )}

            <p>
              <span className="font-medium">Tanggal Diajukan:</span>{" "}
              {formatDate(pengajuan.created_at)}
            </p>

            {pengajuan.lampiran && (
              <a
                href={
                  pengajuan.lampiran.startsWith("http")
                    ? pengajuan.lampiran
                    : `${baseURL}/storage/${pengajuan.lampiran}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="mt-2">
                  <FileText className="h-4 w-4 mr-1" />
                  Lihat Lampiran
                </Button>
              </a>
            )}
          </div>

          {pengajuan.status.toLowerCase().includes("tolak") && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">Ditolak</h4>
                <p className="text-sm text-destructive/90 italic">
                  Pengajuan ini ditolak oleh atasan/verifikator.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Tutup</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
