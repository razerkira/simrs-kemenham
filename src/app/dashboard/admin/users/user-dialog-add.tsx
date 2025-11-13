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

const roleOptions = [
  { value: 1, label: "Admin" },
  { value: 2, label: "Admin Unit" },
  { value: 3, label: "Admin Instansi" },
  { value: 4, label: "Admin Pusat" },
  { value: 5, label: "Pegawai" },
];

const statusOptions = [
  { value: "1", label: "Aktif" },
  { value: "2", label: "Tidak Aktif" },
];

export default function UserDialogAdd({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: 0,
    status_aktif: "1",
  });

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.post("/api/v1/users", {
        ...payload,
        status_aktif: payload.status_aktif,
      }),
    onSuccess: () => {
      toast.success("User berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      setForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: 0,
        status_aktif: "1",
      });
      setOpen(false);
    },
    onError: () => toast.error("Gagal menambah user"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Nama</Label>
            <Input
              placeholder="Nama lengkap"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Username</Label>
            <Input
              placeholder="Username unik"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Email</Label>
            <Input
              type="email"
              placeholder="Alamat email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Password</Label>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Role</Label>
            <Select
              value={form.role ? String(form.role) : ""}
              onValueChange={(v) => handleChange("role", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={String(r.value)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2">Status Aktif</Label>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
