"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Check, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  email: string;
  no_hp: string;
}

interface PengajuanCuti {
  id: number;
  pegawai_id: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jenis_cuti: string;
  alasan: string;
  lampiran: string | null;
  status: string;
  created_at: string;
  pegawai: Pegawai;
}

interface PaginationResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: PengajuanCuti[];
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  let variant: "success" | "destructive" | "warning" = "warning";
  let text = status;

  if (lower.includes("disetujui")) variant = "success";
  else if (lower.includes("tolak")) variant = "destructive";
  else variant = "warning";

  if (lower.includes("diajukan") || lower.includes("menunggu"))
    text = "Menunggu";
  else if (lower.includes("disetujui")) text = "Disetujui";
  else if (lower.includes("tolak")) text = "Ditolak";

  return <Badge variant={variant}>{text}</Badge>;
}

export default function VerifikasiCutiPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PengajuanCuti | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [catatan, setCatatan] = useState("");

  const queryClient = useQueryClient();

  // ====== FETCH DATA ======
  const fetchPendingCuti = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/verifikasi/cuti/pending", {
      params: { page, search },
    });
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["verifikasi-cuti", page, search],
    queryFn: fetchPendingCuti,
    placeholderData: (prev) => prev,
  });

  // ====== MUTASI APPROVE / REJECT ======
  const verifikasiMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      catatan,
    }: {
      id: number;
      status: "Disetujui" | "Ditolak";
      catatan?: string | null;
    }) => {
      return await api.post(`/api/v1/verifikasi/cuti/${id}`, {
        status_verifikasi: status,
        catatan: catatan || null,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Cuti ${variables.status === "Disetujui" ? "disetujui" : "ditolak"}`
      );
      queryClient.invalidateQueries({ queryKey: ["verifikasi-cuti"] });
      setOpenDialog(false);
      setCatatan("");
      setSelected(null);
    },
    onError: () => {
      toast.error("Gagal memproses verifikasi cuti");
    },
  });

  // ====== HANDLER ======
  const handleOpen = (item: PengajuanCuti) => {
    setSelected(item);
    setOpenDialog(true);
  };

  const handleSubmit = (status: "Disetujui" | "Ditolak") => {
    if (!selected) return;
    verifikasiMutation.mutate({
      id: selected.id,
      status,
      catatan: catatan || null,
    });
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "-";
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return "-";
    return format(parsedDate, "dd MMMM yyyy", { locale: localeID });
  };

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://simrs.idxpert.id";

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <CardTitle>Verifikasi Pengajuan Cuti</CardTitle>
        <input
          type="text"
          placeholder="Cari nama pegawai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {isLoading
                ? "Memuat data..."
                : data?.data.length === 0
                ? "Tidak ada pengajuan cuti yang perlu diverifikasi."
                : `Menampilkan ${data?.data.length} dari total ${data?.total} pengajuan.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pegawai</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Jenis / Alasan Cuti</TableHead>
                <TableHead>Tanggal Mulai</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
                <TableHead>Lampiran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.pegawai?.nama}</TableCell>
                  <TableCell>{item.pegawai?.nip}</TableCell>
                  <TableCell>{item.jenis_cuti}</TableCell>
                  <TableCell>{formatDate(item.tanggal_mulai)}</TableCell>
                  <TableCell>{formatDate(item.tanggal_selesai)}</TableCell>
                  <TableCell>
                    {item.lampiran ? (
                      <a
                        href={
                          item.lampiran.startsWith("http")
                            ? item.lampiran
                            : `${baseURL}/storage/${item.lampiran}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="mt-2">
                          <FileText className="h-4 w-4 mr-1" />
                          Buka Dokumen
                        </Button>
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(item)}
                    >
                      Verifikasi
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Halaman {data?.current_page} dari {data?.last_page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={data?.current_page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data?.current_page === data?.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      {/* ====== DIALOG VERIFIKASI ====== */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verifikasi Pengajuan Cuti</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p>
              <strong>Nama:</strong> {selected?.pegawai?.nama}
            </p>
            <p>
              <strong>Jenis:</strong> {selected?.jenis_cuti}
            </p>
            <p>
              <strong>Alasan:</strong> {selected?.alasan}
            </p>
            <p>
              <strong>Tanggal:</strong>{" "}
              {formatDate(selected?.tanggal_mulai ?? "")} -{" "}
              {formatDate(selected?.tanggal_selesai ?? "")}
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">Catatan</label>
              <Input
                placeholder="Masukkan catatan (opsional)"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => handleSubmit("Ditolak")}
              disabled={verifikasiMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Tolak
            </Button>
            <Button
              variant="default"
              onClick={() => handleSubmit("Disetujui")}
              disabled={verifikasiMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
