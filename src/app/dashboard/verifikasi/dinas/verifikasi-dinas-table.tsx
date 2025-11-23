"use client";

import { useEffect, useState } from "react";
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
import { useAuthStore } from "@/store/auth";
import { guardRole } from "@/lib/guard-role";

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  email: string;
  no_hp: string;
}

interface PerjalananDinas {
  id: number;
  pegawai_id: number;
  tanggal_berangkat: string;
  tanggal_kembali: string;
  is_full: string;
  keterangan: string;
  status: string;
  lampiran: string | null;
  created_at: string;
  pegawai: Pegawai;
}

interface PaginationResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: PerjalananDinas[];
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

export default function VerifikasiPerjalananPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PerjalananDinas | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [catatan, setCatatan] = useState("");

  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  // Run guard role
  useEffect(() => {
    if (user?.role) {
      guardRole(
        (r) => r.isVerificator, // hanya role 2/3/4/1
        user.role
      );
    }
  }, [user]);

  // ====== FETCH DATA ======
  const fetchPendingPerjalanan = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/verifikasi/perjalanan/pending", {
      params: { page, search },
    });
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["verifikasi-perjalanan", page, search],
    queryFn: fetchPendingPerjalanan,
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
      return await api.post(`/api/v1/verifikasi/perjalanan/${id}`, {
        status_verifikasi: status,
        catatan: catatan || null,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(
        `Perjalanan ${
          variables.status === "Disetujui" ? "disetujui" : "ditolak"
        }`
      );
      queryClient.invalidateQueries({
        queryKey: ["verifikasi-perjalanan"],
        exact: false,
      });
      setOpenDialog(false);
      setCatatan("");
      setSelected(null);
    },
    onError: () => {
      toast.error("Gagal memproses verifikasi perjalanan");
    },
  });

  // ====== HANDLER ======
  const handleOpen = (item: PerjalananDinas) => {
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
        <CardTitle>Verifikasi Perjalanan Dinas</CardTitle>
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
                ? "Tidak ada perjalanan dinas yang perlu diverifikasi."
                : `Menampilkan ${data?.data.length} dari total ${data?.total} pengajuan.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pegawai</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Keterangan</TableHead>
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
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell>
                    {new Date(item.tanggal_berangkat).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {new Date(item.tanggal_kembali).toLocaleString("id-ID")}
                  </TableCell>
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
            <DialogTitle>Verifikasi Perjalanan Dinas</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p>
              <strong>Nama:</strong> {selected?.pegawai?.nama}
            </p>
            <p>
              <strong>Keterangan:</strong> {selected?.keterangan}
            </p>
            <p>
              <strong>Tanggal:</strong>{" "}
              {formatDate(selected?.tanggal_berangkat ?? "")} -{" "}
              {formatDate(selected?.tanggal_kembali ?? "")}
            </p>
            {selected?.lampiran && (
              <p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `${baseURL}/storage/${selected?.lampiran}`,
                      "_blank"
                    )
                  }
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Buka Dokumen Pendukung
                </Button>
              </p>
            )}
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
