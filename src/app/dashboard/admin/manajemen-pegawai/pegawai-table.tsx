"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash,
  Plus,
  Search,
} from "lucide-react";

import { useAuthStore } from "@/store/auth";
import PegawaiDialogAdd from "./pegawai-dialog-add";
import PegawaiDialogEdit from "./pegawai-dialog-edit";

interface Pegawai {
  id: number;
  user_id: number;
  nip: string;
  nama: string;
  jabatan: string;
  email: string;
  no_hp: string;
  instansi_id: number;
  unit_id: number;
  status_aktif: number;
  user: { username: string };
  instansi: { nama_instansi: string };
  unit: { nama_unit: string };
}

interface PaginationResponse {
  current_page: number;
  last_page: number;
  total: number;
  data: Pegawai[];
}

export default function PegawaiTable() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentRole = user?.role ?? 0;

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [selected, setSelected] = useState<Pegawai | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const fetchPegawai = async (): Promise<PaginationResponse> => {
    const res = await api.get("/api/v1/pegawai", {
      params: { page, search: searchParam },
    });
    return res.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["pegawai", page, searchParam],
    queryFn: fetchPegawai,
    placeholderData: (prev) => prev,
  });

  const deletePegawai = useMutation({
    mutationFn: async (id: number) => await api.delete(`/api/v1/pegawai/${id}`),
    onSuccess: () => {
      toast.success("Pegawai berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["pegawai"] });
    },
    onError: () => toast.error("Gagal menghapus pegawai"),
  });

  const handleSearch = () => {
    setPage(1);
    setSearchParam(searchInput.trim());
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
        <CardTitle>Daftar Pegawai</CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Cari nama / NIP..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56"
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4 mr-1" /> Cari
          </Button>
          {currentRole === 1 && (
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Tambah
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {isLoading
                ? "Memuat data..."
                : data?.data.length === 0
                ? "Tidak ada pegawai ditemukan."
                : `Menampilkan ${data?.data.length} dari total ${data?.total} pegawai.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Email</TableHead>
                {/* <TableHead>No HP</TableHead> */}
                <TableHead>User</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Instansi</TableHead>
                <TableHead>Status</TableHead>
                {currentRole === 1 && (
                  <TableHead className="text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nip}</TableCell>
                  <TableCell>{p.nama}</TableCell>
                  <TableCell>{p.jabatan}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  {/* <TableCell>{p.no_hp}</TableCell> */}
                  <TableCell>{p.user?.username || "-"}</TableCell>
                  <TableCell>{p.unit?.nama_unit || "-"}</TableCell>
                  <TableCell>{p.instansi?.nama_instansi || "-"}</TableCell>
                  <TableCell>{p.status_aktif ? "Aktif" : "Nonaktif"}</TableCell>
                  {currentRole === 1 && (
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(p);
                          setOpenEdit(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Yakin ingin menghapus pegawai ini?"))
                            deletePegawai.mutate(p.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Halaman {data?.current_page ?? 1} dari {data?.last_page ?? 1}
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

      {/* Dialogs */}
      <PegawaiDialogAdd open={openAdd} setOpen={setOpenAdd} />
      {selected && (
        <PegawaiDialogEdit
          open={openEdit}
          setOpen={setOpenEdit}
          pegawai={selected}
          clearSelected={() => setSelected(null)}
        />
      )}
    </Card>
  );
}
