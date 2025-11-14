"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function PegawaiDialogAdd({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    user_id: "",
    nip: "",
    nama: "",
    jabatan: "",
    email: "",
    no_hp: "",
    instansi_id: "",
    unit_id: "",
    status_aktif: "1",
  });

  const { data: users } = useQuery({
    queryKey: ["users-select"],
    queryFn: async () => {
      const res = await api.get("/api/v1/users");
      return res.data.data;
    },
  });

  // Fetch instansi dari API
  const { data: instansiData } = useQuery({
    queryKey: ["instansi"],
    queryFn: async () => {
      const res = await api.get("/api/v1/instansi");
      return res.data.data;
    },
  });

  // Fetch unit dari API
  const { data: unitData } = useQuery({
    queryKey: ["unitkerja"],
    queryFn: async () => {
      const res = await api.get("/api/v1/unitkerja");
      return res.data.data;
    },
  });

  // Reset unit_id saat instansi_id berubah
  useEffect(() => {
    if (form.instansi_id) {
      setForm((prev) => ({ ...prev, unit_id: "" }));
    }
  }, [form.instansi_id]);

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.post("/api/v1/pegawai", payload),
    onSuccess: () => {
      toast.success("Pegawai berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["pegawai"], exact: false });
      setOpen(false);
      setForm({
        user_id: "",
        nip: "",
        nama: "",
        jabatan: "",
        email: "",
        no_hp: "",
        instansi_id: "",
        unit_id: "",
        status_aktif: "1",
      });
    },
    onError: () => toast.error("Gagal menambah pegawai"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Filter unit berdasarkan instansi yang dipilih
  const filteredUnits = unitData?.filter(
    (u: any) => String(u.instansi_id) === form.instansi_id
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Tambah Pegawai</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
              <Label>NIP</Label>
              <Input
                placeholder="NIP Anda"
                value={form.nip}
                onChange={(e) => handleChange("nip", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={form.nama}
                onChange={(e) => handleChange("nama", e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>

            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Input
                value={form.jabatan}
                onChange={(e) => handleChange("jabatan", e.target.value)}
                placeholder="Jabatan"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Email Anda"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>No HP</Label>
              <Input
                placeholder="No HP"
                value={form.no_hp}
                onChange={(e) => handleChange("no_hp", e.target.value)}
              />
            </div>

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
              <Label>Unit</Label>
              <Select
                value={form.unit_id}
                onValueChange={(v) => handleChange("unit_id", v)}
                disabled={!form.instansi_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Unit" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUnits?.map((u: any) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.nama_unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
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
          </div>
        </div>

        <DialogFooter className="mt-4">
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