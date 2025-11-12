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

export default function UserDialogAdd({ open, setOpen }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: 0,
  });

  const mutation = useMutation({
    mutationFn: async (payload: typeof form) =>
      api.post("/api/v1/users", payload),
    onSuccess: () => {
      toast.success("User berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setForm({ name: "", username: "", email: "", password: "", role: 0 });
      setOpen(false);
    },
    onError: () => toast.error("Gagal menambah user"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Select
            value={form.role ? String(form.role) : ""}
            onValueChange={(v) => setForm({ ...form, role: Number(v) })}
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
