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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash, Plus, Search, Building2, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import UnitKerjaDialogAdd from "./unitkerja-dialog-add";
import UnitKerjaDialogEdit from "./unitkerja-dialog-edit";
import InstansiDialogEdit from "./instansi-dialog-edit";
import InstansiDialogAdd from "./instansi-dialog-add";

interface Instansi {
  id: number;
  nama_instansi: string;
  singkatan: string;
  status: number;
}

interface UnitKerja {
  id: number;
  instansi_id: number;
  nama_unit: string;
  kode_unit: string;
  status: number;
  instansi: { nama_instansi: string };
}

export default function InstansiUnitKerjaPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentRole = user?.role ?? 0;

  const [activeTab, setActiveTab] = useState("instansi");

  // Instansi states
  const [searchInstansi, setSearchInstansi] = useState("");
  const [selectedInstansi, setSelectedInstansi] = useState<Instansi | null>(
    null
  );
  const [openAddInstansi, setOpenAddInstansi] = useState(false);
  const [openEditInstansi, setOpenEditInstansi] = useState(false);

  // Unit Kerja states
  const [searchUnit, setSearchUnit] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<UnitKerja | null>(null);
  const [openAddUnit, setOpenAddUnit] = useState(false);
  const [openEditUnit, setOpenEditUnit] = useState(false);

  // Fetch Instansi
  const { data: instansiData, isLoading: isLoadingInstansi } = useQuery({
    queryKey: ["instansi"],
    queryFn: async () => {
      const res = await api.get("/api/v1/instansi");
      return res.data.data;
    },
  });

  // Fetch Unit Kerja
  const { data: unitData, isLoading: isLoadingUnit } = useQuery({
    queryKey: ["unitkerja"],
    queryFn: async () => {
      const res = await api.get("/api/v1/unitkerja");
      return res.data.data;
    },
  });

  // Delete Instansi
  const deleteInstansi = useMutation({
    mutationFn: async (id: number) =>
      await api.delete(`/api/v1/instansi/${id}`),
    onSuccess: () => {
      toast.success("Instansi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["instansi"] });
    },
    onError: () => toast.error("Gagal menghapus instansi"),
  });

  // Delete Unit Kerja
  const deleteUnit = useMutation({
    mutationFn: async (id: number) =>
      await api.delete(`/api/v1/unitkerja/${id}`),
    onSuccess: () => {
      toast.success("Unit kerja berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["unitkerja"] });
    },
    onError: () => toast.error("Gagal menghapus unit kerja"),
  });

  // Filter data
  const filteredInstansi = instansiData?.filter(
    (i: Instansi) =>
      i.nama_instansi.toLowerCase().includes(searchInstansi.toLowerCase()) ||
      i.singkatan.toLowerCase().includes(searchInstansi.toLowerCase())
  );

  const filteredUnit = unitData?.filter(
    (u: UnitKerja) =>
      u.nama_unit.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.kode_unit.toLowerCase().includes(searchUnit.toLowerCase()) ||
      u.instansi?.nama_instansi.toLowerCase().includes(searchUnit.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Manajemen Instansi & Unit Kerja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger
                value="instansi"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="h-4 w-4" />
                Instansi
              </TabsTrigger>
              <TabsTrigger
                value="unit"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4" />
                Unit Kerja
              </TabsTrigger>
            </TabsList>

            {/* TAB INSTANSI */}
            <TabsContent value="instansi" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Cari instansi..."
                    value={searchInstansi}
                    onChange={(e) => setSearchInstansi(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {currentRole === 1 && (
                  <Button onClick={() => setOpenAddInstansi(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Instansi
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    {isLoadingInstansi
                      ? "Memuat data..."
                      : filteredInstansi?.length === 0
                      ? "Tidak ada instansi ditemukan."
                      : `Menampilkan ${filteredInstansi?.length} instansi.`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Instansi</TableHead>
                      <TableHead>Singkatan</TableHead>
                      <TableHead>Status</TableHead>
                      {currentRole === 1 && (
                        <TableHead className="text-right">Aksi</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstansi?.map((i: Instansi) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">
                          {i.nama_instansi}
                        </TableCell>
                        <TableCell>{i.singkatan}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              i.status
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {i.status ? "Aktif" : "Nonaktif"}
                          </span>
                        </TableCell>
                        {currentRole === 1 && (
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInstansi(i);
                                setOpenEditInstansi(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Yakin ingin menghapus instansi ini? Unit kerja terkait juga akan terpengaruh."
                                  )
                                )
                                  deleteInstansi.mutate(i.id);
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
            </TabsContent>

            {/* TAB UNIT KERJA */}
            <TabsContent value="unit" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Cari unit kerja..."
                    value={searchUnit}
                    onChange={(e) => setSearchUnit(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {currentRole === 1 && (
                  <Button onClick={() => setOpenAddUnit(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Unit Kerja
                  </Button>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    {isLoadingUnit
                      ? "Memuat data..."
                      : filteredUnit?.length === 0
                      ? "Tidak ada unit kerja ditemukan."
                      : `Menampilkan ${filteredUnit?.length} unit kerja.`}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Unit</TableHead>
                      <TableHead>Kode Unit</TableHead>
                      <TableHead>Instansi</TableHead>
                      <TableHead>Status</TableHead>
                      {currentRole === 1 && (
                        <TableHead className="text-right">Aksi</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnit?.map((u: UnitKerja) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.nama_unit}
                        </TableCell>
                        <TableCell>{u.kode_unit}</TableCell>
                        <TableCell>
                          {u.instansi?.nama_instansi || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              u.status
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.status ? "Aktif" : "Nonaktif"}
                          </span>
                        </TableCell>
                        {currentRole === 1 && (
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUnit(u);
                                setOpenEditUnit(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Yakin ingin menghapus unit kerja ini?"
                                  )
                                )
                                  deleteUnit.mutate(u.id);
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <InstansiDialogAdd open={openAddInstansi} setOpen={setOpenAddInstansi} />
      {selectedInstansi && (
        <InstansiDialogEdit
          open={openEditInstansi}
          setOpen={setOpenEditInstansi}
          instansi={selectedInstansi}
          clearSelected={() => setSelectedInstansi(null)}
        />
      )}
      <UnitKerjaDialogAdd open={openAddUnit} setOpen={setOpenAddUnit} />
      {selectedUnit && (
        <UnitKerjaDialogEdit
          open={openEditUnit}
          setOpen={setOpenEditUnit}
          unitKerja={selectedUnit}
          clearSelected={() => setSelectedUnit(null)}
        />
      )}
    </div>
  );
}
