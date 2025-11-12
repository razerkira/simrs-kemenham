"use client";

import { useState } from "react";
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
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import DialogEditPegawai from "./dialog-edit-pegawai";
import { cn } from "@/lib/utils";
import { Pegawai, Profile, UserProfile } from "@/types/database";



interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface ManajemenPegawaiTableProps {
  dataPegawai: Pegawai[];
  loading?: boolean;
  pagination: PaginationProps;
}

function RoleBadge({ role }: { role: number }) {
  const roleMap: Record<number, string> = {
    1: "Admin",
    2: "Admin Unit",
    3: "Admin Pusat",
    4: "Admin Instansi",
    5: "Pegawai",
  };
  const variant =
    role === 1 ? "destructive" : role === 5 ? "outline" : "secondary";
  return <Badge variant={variant}>{roleMap[role] ?? "Unknown"}</Badge>;
}

export default function ManajemenPegawaiTable({
  dataPegawai,
  loading,
  pagination,
}: ManajemenPegawaiTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | UserProfile | Profile | null>(null);

  const handleOpenEditDialog = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setIsEditDialogOpen(true);
  };

  const { currentPage, lastPage, onPageChange, total } = pagination;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Seluruh Pegawai</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {loading
                ? "Memuat data pegawai..."
                : dataPegawai.length === 0
                ? "Tidak ada data pegawai."
                : `Menampilkan ${dataPegawai.length} dari total ${total} pegawai.`}
            </TableCaption>

            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Instansi</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : (
                dataPegawai.map((pegawai) => (
                  <TableRow key={pegawai.id}>
                    <TableCell className="font-medium">
                      {pegawai.nama ?? "-"}
                    </TableCell>
                    <TableCell>{pegawai.nip ?? "-"}</TableCell>
                    <TableCell>{pegawai.email ?? "-"}</TableCell>
                    <TableCell>{pegawai.jabatan ?? "-"}</TableCell>
                    <TableCell>
                      {pegawai.instansi?.nama_instansi ?? "-"}
                    </TableCell>
                    <TableCell>{pegawai.unit?.nama_unit ?? "-"}</TableCell>
                    <TableCell>
                      <RoleBadge role={pegawai.user?.role} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenEditDialog(pegawai)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Halaman {currentPage} dari {lastPage}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>

      <DialogEditPegawai
        pegawai={selectedPegawai}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </Card>
  );
}
