"use client";

import { useState } from "react";
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

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const statusOptions = [
  { value: "1", label: "Aktif" },
  { value: "0", label: "Tidak Aktif" },
];

export default function UnitKerjaDialogAdd({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    instansi_id: "",
    nama_unit: "",
    kode_unit: "",
    status: "1",
  });

  const { data: instansiData } = useQuery({
    queryKey: ["instansi"],
    queryFn: async () => {
      const res = await api.get("/api/v1/instansi");
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.post("/api/v1/unitkerja", payload),
    onSuccess: () => {
      toast.success("Unit kerja berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["unitkerja"], exact: false });
      setOpen(false);
      setForm({
        instansi_id: "",
        nama_unit: "",
        kode_unit: "",
        status: "1",
      });
    },
    onError: () => toast.error("Gagal menambah unit kerja"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Unit Kerja</DialogTitle>
        </DialogHeader>

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
              placeholder="Masukkan nama unit"
              value={form.nama_unit}
              onChange={(e) => handleChange("nama_unit", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Kode Unit</Label>
            <Input
              placeholder="Masukkan kode unit"
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
