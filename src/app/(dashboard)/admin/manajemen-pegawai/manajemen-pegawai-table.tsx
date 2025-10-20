// src/app/(dashboard)/admin/manajemen-pegawai/manajemen-pegawai-table.tsx
"use client"

// --- TAMBAHAN BARU ---
import { useState } from 'react'
import { Profile, UserRole } from '@/types/database'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
// --- IMPOR KOMPONEN DIALOG BARU KITA ---
import DialogEditPegawai from './dialog-edit-pegawai'

// Tipe data untuk props (tidak berubah)
interface ManajemenPegawaiTableProps {
  dataPegawai: Profile[]
}

// ===============================================================
// Komponen Bantuan (Helper) untuk Badge Role (Tidak berubah)
// ===============================================================
function RoleBadge({ role }: { role: UserRole | null }) {
  const roleText = role ?? 'pegawai'
  const variant: "destructive" | "default" | "secondary" | "outline" =
    role === 'admin' ? 'destructive' :
    role === 'supervisor' ? 'default' :
    role === 'verificator' ? 'secondary' :
    'outline'

  return (
    <Badge variant={variant} className="capitalize">
      {roleText}
    </Badge>
  )
}
// ===============================================================

// ===============================================================
// Komponen Utama Tabel
// ===============================================================
export default function ManajemenPegawaiTable({ dataPegawai }: ManajemenPegawaiTableProps) {
  
  // --- STATE BARU UNTUK MENGONTROL DIALOG ---
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPegawai, setSelectedPegawai] = useState<Profile | null>(null)
  
  // Fungsi untuk membuka dialog edit
  const handleOpenEditDialog = (pegawai: Profile) => {
    setSelectedPegawai(pegawai);
    setIsEditDialogOpen(true);
  }
  // --- SELESAI STATE BARU ---

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
              : "Daftar seluruh pegawai yang terdaftar di sistem."
            }
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
                <TableCell className="font-medium">{pegawai.nama ?? '-'}</TableCell>
                <TableCell>{pegawai.nip ?? '-'}</TableCell>
                <TableCell>{pegawai.email ?? '-'}</TableCell>
                <TableCell>{pegawai.jabatan ?? '-'}</TableCell>
                <TableCell>{pegawai.pangkat_golongan ?? '-'}</TableCell>
                <TableCell>{pegawai.unit_kerja ?? '-'}</TableCell>
                <TableCell>
                  <RoleBadge role={pegawai.role} />
                </TableCell>
                <TableCell className="text-right">
                  {/* --- UBAH TOMBOL INI --- */}
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleOpenEditDialog(pegawai)} // Tambahkan onClick
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {/* --- SELESAI UBAH TOMBOL --- */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* --- TAMBAHKAN KOMPONEN DIALOG DI SINI --- */}
        <DialogEditPegawai
          pegawai={selectedPegawai}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
        {/* --- SELESAI TAMBAHAN DIALOG --- */}

      </CardContent>
    </Card>
  )
}