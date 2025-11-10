// src/app/(dashboard)/admin/manajemen-pegawai/manajemen-pegawai-table.tsx
"use client";

import { useState } from "react";
import { Profile, UserRole } from "@/types/database";
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
import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DialogEditPegawai from "./dialog-edit-pegawai";

interface ManajemenPegawaiTableProps {
  dataPegawai: Profile[];
}

function RoleBadge({ role }: { role: UserRole | null }) {
  const roleText = role ?? "pegawai";
  const variant: "destructive" | "default" | "secondary" | "outline" =
    role === "admin"
      ? "destructive"
      : role === "supervisor"
      ? "default"
      : role === "verificator"
      ? "secondary"
      : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {roleText}
    </Badge>
  );
}
export default function ManajemenPegawaiTable({
  dataPegawai,
}: ManajemenPegawaiTableProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Profile | null>(null);

  const handleOpenEditDialog = (pegawai: Profile) => {
    setSelectedPegawai(pegawai);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Seluruh Pegawai</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>
            {dataPegawai.length === 0
              ? "Tidak ada data pegawai."
              : "Daftar seluruh pegawai yang terdaftar di sistem."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Pangkat/Golongan</TableHead>
              <TableHead>Unit Kerja</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataPegawai.map((pegawai) => (
              <TableRow key={pegawai.id}>
                <TableCell className="font-medium">
                  {pegawai.nama ?? "-"}
                </TableCell>
                <TableCell>{pegawai.nip ?? "-"}</TableCell>
                <TableCell>{pegawai.email ?? "-"}</TableCell>
                <TableCell>{pegawai.jabatan ?? "-"}</TableCell>
                <TableCell>{pegawai.pangkat_golongan ?? "-"}</TableCell>
                <TableCell>{pegawai.unit_kerja ?? "-"}</TableCell>
                <TableCell>
                  <RoleBadge role={pegawai.role} />
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
            ))}
          </TableBody>
        </Table>

        <DialogEditPegawai
          pegawai={selectedPegawai}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </CardContent>
    </Card>
  );
}
