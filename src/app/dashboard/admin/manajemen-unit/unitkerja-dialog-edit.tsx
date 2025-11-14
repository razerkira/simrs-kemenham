"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface UnitKerja {
  id: number;
  instansi_id: number;
  nama_unit: string;
  kode_unit: string;
  status: number;
}

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  unitKerja: UnitKerja;
  clearSelected: () => void;
}

const statusOptions = [
  { value: "1", label: "Aktif" },
  { value: "0", label: "Tidak Aktif" },
];

export default function UnitKerjaDialogEdit({
  open,
  setOpen,
  unitKerja,
  clearSelected,
}: Props) {
  const queryClient = useQueryClient();
  const [isFormReady, setIsFormReady] = useState(false);
  const [form, setForm] = useState({
    instansi_id: "",
    nama_unit: "",
    kode_unit: "",
    status: "1",
  });

  const { data: instansiData, isLoading: isLoadingInstansi } = useQuery({
    queryKey: ["instansi"],
    queryFn: async () => {
      const res = await api.get("/api/v1/instansi");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (unitKerja && instansiData && !isFormReady) {
      setForm({
        instansi_id: String(unitKerja.instansi_id || ""),
        nama_unit: unitKerja.nama_unit || "",
        kode_unit: unitKerja.kode_unit || "",
        status: String(unitKerja.status ?? "1"),
      });
      setIsFormReady(true);
    }
  }, [unitKerja, instansiData, isFormReady]);

  useEffect(() => {
    if (!open) {
      setIsFormReady(false);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.put(`/api/v1/unitkerja/${unitKerja.id}`, payload),
    onSuccess: () => {
      toast.success("Unit kerja berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["unitkerja"], exact: false });
      setOpen(false);
      clearSelected();
    },
    onError: () => toast.error("Gagal memperbarui unit kerja"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isLoading = isLoadingInstansi || !isFormReady;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Unit Kerja</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading data...
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Instansi</Label>
                <Select
                  value={form.instansi_id}
                  onValueChange={(v) => handleChange("instansi_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Instansi" />
                  </SelectTrigger>
                  <SelectContent>
                    {instansiData?.map((i: any) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.nama_instansi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nama Unit</Label>
                <Input
                  value={form.nama_unit}
                  onChange={(e) => handleChange("nama_unit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Kode Unit</Label>
                <Input
                  value={form.kode_unit}
                  onChange={(e) => handleChange("kode_unit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  clearSelected();
                }}
              >
                Batal
              </Button>
              <Button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
