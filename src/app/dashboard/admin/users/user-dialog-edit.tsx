"use client";

import { useState, useEffect } from "react";
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

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: number;
  status_aktif: boolean;
}

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  user: User | any | null;
  clearSelected: () => void;
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
  { value: "0", label: "Tidak Aktif" },
];

export default function UserDialogEdit({
  open,
  setOpen,
  user,
  clearSelected,
}: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: 0,
    status_aktif: "1",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
        status_aktif: user.status_aktif ? "1" : "0",
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async () =>
      api.put(`/api/v1/users/${user?.id}`, {
        ...form,
        status_aktif: parseInt(form.status_aktif),
        email_verified_at: form.status_aktif == "1" ? new Date() : null,
      }),
    onSuccess: () => {
      toast.success("User berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false });
      setOpen(false);
      clearSelected();
    },
    onError: () => toast.error("Gagal memperbarui user"),
  });

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
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
            <Label className="mb-2">
              Password (kosongkan jika tidak diubah)
            </Label>
            <Input
              type="password"
              placeholder="Biarkan kosong jika tidak diubah"
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
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
