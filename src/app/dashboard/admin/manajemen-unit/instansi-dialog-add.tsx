"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function InstansiDialogAdd({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    nama_instansi: "",
    singkatan: "",
    status: "1",
  });

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.post("/api/v1/instansi", payload),
    onSuccess: () => {
      toast.success("Instansi berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["instansi"], exact: false });
      setOpen(false);
      setForm({
        nama_instansi: "",
        singkatan: "",
        status: "1",
      });
    },
    onError: () => toast.error("Gagal menambah instansi"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Instansi</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Instansi</Label>
            <Input
              placeholder="Masukkan nama instansi"
              value={form.nama_instansi}
              onChange={(e) => handleChange("nama_instansi", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Singkatan</Label>
            <Input
              placeholder="Masukkan singkatan"
              value={form.singkatan}
              onChange={(e) => handleChange("singkatan", e.target.value)}
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
