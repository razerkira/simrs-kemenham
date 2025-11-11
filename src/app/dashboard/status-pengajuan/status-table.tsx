"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DialogStatusDetail from "./dialog-status-detail";
import api from "@/lib/axios";

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

interface PaginationResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: any[];
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

export default function StatusTable() {
  const [pageCuti, setPageCuti] = useState(1);
  const [pageDinas, setPageDinas] = useState(1);
  const [searchCuti, setSearchCuti] = useState("");
  const [searchDinas, setSearchDinas] = useState("");

  const [selectedDetail, setSelectedDetail] = useState<
    PengajuanCuti | PengajuanDinas | null
  >(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCuti = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/cuti/my", {
      params: { page: pageCuti, search: searchCuti },
    });
    return res.data;
  };

  const fetchDinas = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/perjalanan/my", {
      params: { page: pageDinas, search: searchDinas },
    });
    return res.data;
  };

  const { data: cutiData, isLoading: loadingCuti } = useQuery({
    queryKey: ["cuti", pageCuti, searchCuti],
    queryFn: fetchCuti,
    keepPreviousData: true,
  });

  const { data: dinasData, isLoading: loadingDinas } = useQuery({
    queryKey: ["dinas", pageDinas, searchDinas],
    queryFn: fetchDinas,
    keepPreviousData: true,
  });

  const handleOpenDetail = (item: PengajuanCuti | PengajuanDinas) => {
    setSelectedDetail(item);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Cuti */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <CardTitle>Riwayat Pengajuan Cuti</CardTitle>
          <input
            type="text"
            placeholder="Cari cuti..."
            value={searchCuti}
            onChange={(e) => setSearchCuti(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                {loadingCuti
                  ? "Memuat data..."
                  : cutiData?.length === 0
                  ? "Tidak ada pengajuan cuti."
                  : `Menampilkan ${cutiData?.length} dari total ${cutiData?.total} pengajuan.`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Jenis / Alasan Cuti</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cutiData?.map((cuti: PengajuanCuti) => (
                  <TableRow
                    key={cuti.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenDetail(cuti)}
                  >
                    <TableCell>
                      {new Date(cuti.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {cuti.jenis_cuti} - {cuti.keterangan}
                    </TableCell>
                    <TableCell>
                      {new Date(cuti.tanggal_mulai).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      {new Date(cuti.tanggal_selesai).toLocaleDateString(
                        "id-ID"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={cuti.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Halaman {cutiData?.current_page} dari {cutiData?.last_page}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={cutiData?.current_page === 1}
              onClick={() => setPageCuti((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={cutiData?.current_page === cutiData?.last_page}
              onClick={() => setPageCuti((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dinas */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <CardTitle>Riwayat Perjalanan Dinas</CardTitle>
          <input
            type="text"
            placeholder="Cari perjalanan..."
            value={searchDinas}
            onChange={(e) => setSearchDinas(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                {loadingDinas
                  ? "Memuat data..."
                  : dinasData?.length === 0
                  ? "Tidak ada pengajuan dinas."
                  : `Menampilkan ${dinasData?.length} dari total ${dinasData?.total} pengajuan.`}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Deskripsi Kegiatan</TableHead>
                  <TableHead>Waktu Mulai</TableHead>
                  <TableHead>Waktu Selesai</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dinasData?.map((dinas: PengajuanDinas) => (
                  <TableRow
                    key={dinas.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleOpenDetail(dinas)}
                  >
                    <TableCell>
                      {new Date(dinas.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>{dinas.keterangan}</TableCell>
                    <TableCell>
                      {new Date(dinas.tanggal_berangkat).toLocaleString(
                        "id-ID"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(dinas.tanggal_kembali).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={dinas.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Halaman {dinasData?.current_page} dari {dinasData?.last_page}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={dinasData?.current_page === 1}
              onClick={() => setPageDinas((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={dinasData?.current_page === dinasData?.last_page}
              onClick={() => setPageDinas((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DialogStatusDetail
        pengajuan={selectedDetail}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
