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
}

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  pegawai: Pegawai;
  clearSelected: () => void;
}

const statusOptions = [
  { value: "1", label: "Aktif" },
  { value: "0", label: "Tidak Aktif" },
];

export default function PegawaiDialogEdit({
  open,
  setOpen,
  pegawai,
  clearSelected,
}: Props) {
  const queryClient = useQueryClient();

  // Form state
  const [form, setForm] = useState({
    user_id: String(pegawai.user_id || ""),
    nip: pegawai.nip || "",
    nama: pegawai.nama || "",
    jabatan: pegawai.jabatan || "",
    email: pegawai.email || "",
    no_hp: pegawai.no_hp || "",
    instansi_id: String(pegawai.instansi_id || ""),
    unit_id: String(pegawai.unit_id || ""),
    status_aktif: String(pegawai.status_aktif || "1"),
  });

  // Re-sync saat pegawai berubah
  useEffect(() => {
    if (pegawai) {
      setForm({
        user_id: String(pegawai.user_id || ""),
        nip: pegawai.nip || "",
        nama: pegawai.nama || "",
        jabatan: pegawai.jabatan || "",
        email: pegawai.email || "",
        no_hp: pegawai.no_hp || "",
        instansi_id: String(pegawai.instansi_id || ""),
        unit_id: String(pegawai.unit_id || ""),
        status_aktif: String(pegawai.status_aktif || "1"),
      });
    }
  }, [pegawai]);

  // Fetch user untuk select
  const { data: users } = useQuery({
    queryKey: ["users-select"],
    queryFn: async () => {
      const res = await api.get("/api/v1/users");
      return res.data.data;
    },
  });

  // Dummy instansi dan unit
  const instansiDummy = [{ id: 1, nama_instansi: "SDM" }];
  const unitDummy = [{ id: 1, nama_unit: "Admin" }];

  // Mutation update
  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.put(`/api/v1/pegawai/${pegawai.id}`, payload),
    onSuccess: () => {
      toast.success("Pegawai berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["pegawai"], exact: false });
      setOpen(false);
      clearSelected();
    },
    onError: () => toast.error("Gagal memperbarui pegawai"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pegawai</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label>User</Label>
          <Select
            value={form.user_id}
            onValueChange={(v) => handleChange("user_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih User" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>NIP</Label>
          <Input
            value={form.nip}
            onChange={(e) => handleChange("nip", e.target.value)}
          />

          <Label>Nama</Label>
          <Input
            value={form.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
          />

          <Label>Jabatan</Label>
          <Input
            value={form.jabatan}
            onChange={(e) => handleChange("jabatan", e.target.value)}
          />

          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Label>No HP</Label>
          <Input
            value={form.no_hp}
            onChange={(e) => handleChange("no_hp", e.target.value)}
          />

          <Label>Instansi</Label>
          <Select
            value={form.instansi_id}
            onValueChange={(v) => handleChange("instansi_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Instansi" />
            </SelectTrigger>
            <SelectContent>
              {instansiDummy.map((i) => (
                <SelectItem key={i.id} value={String(i.id)}>
                  {i.nama_instansi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Unit</Label>
          <Select
            value={form.unit_id}
            onValueChange={(v) => handleChange("unit_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Unit" />
            </SelectTrigger>
            <SelectContent>
              {unitDummy.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.nama_unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Status Aktif</Label>
          <Select
            value={form.status_aktif}
            onValueChange={(v) => handleChange("status_aktif", v)}
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
          <Button onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
