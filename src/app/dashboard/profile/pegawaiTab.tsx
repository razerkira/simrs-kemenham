"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
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
import api from "@/lib/axios";
import { pegawaiSchema } from "./validation/pegawaiSchema";

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  email: string;
  no_hp: string;
  instansi_id: number;
  unit_id: number;
  status_aktif: any;
}

interface Props {
  pegawai: Pegawai | null;
}

export default function PegawaiTab({ pegawai }: Props) {
  const [form, setForm] = useState({
    nip: "",
    nama: "",
    jabatan: "",
    email: "",
    no_hp: "",
    instansi_id: 0,
    unit_id: 0,
    status_aktif: "1",
  });

  const [isFormReady, setIsFormReady] = useState(false); // ✅ Track form initialization

  // 🔹 Ambil data instansi dan unit
  const { data: instansiData, isLoading: isLoadingInstansi } = useQuery({
    queryKey: ["instansi"],
    queryFn: async () => (await api.get("/api/v1/instansi")).data.data,
  });

  const { data: unitData, isLoading: isLoadingUnit } = useQuery({
    queryKey: ["unitkerja"],
    queryFn: async () => (await api.get("/api/v1/unitkerja")).data.data,
  });

  // ✅ Inisialisasi form HANYA setelah semua data tersedia
  useEffect(() => {
    if (pegawai && instansiData && unitData && !isFormReady) {
      setForm({
        nip: pegawai.nip || "",
        nama: pegawai.nama || "",
        jabatan: pegawai.jabatan || "",
        email: pegawai.email || "",
        no_hp: pegawai.no_hp || "",
        instansi_id: pegawai.instansi_id || 0,
        unit_id: pegawai.unit_id || 0,
        status_aktif: String(pegawai.status_aktif ?? "1"),
      });
      setIsFormReady(true); // ✅ Tandai form sudah diinisialisasi
    }
  }, [pegawai, instansiData, unitData, isFormReady]);

  const mutation = useMutation({
    mutationFn: async () => api.put(`/api/v1/pegawai/${pegawai?.id}`, form),
    onSuccess: () => toast.success("Pegawai berhasil diperbarui"),
    onError: () => toast.error("Gagal memperbarui pegawai"),
  });

  const handleChange = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = pegawaiSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    mutation.mutate();
  };

  // ✅ Loading state yang lebih baik
  if (isLoadingInstansi || isLoadingUnit || !isFormReady) {
    return <div>Loading data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="mb-2">NIP</Label>
          <Input
            value={form.nip}
            onChange={(e) => handleChange("nip", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-2">Nama</Label>
          <Input
            value={form.nama}
            onChange={(e) => handleChange("nama", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-2">Jabatan</Label>
          <Input
            value={form.jabatan}
            onChange={(e) => handleChange("jabatan", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-2">Email</Label>
          <Input
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-2">No HP</Label>
          <Input
            value={form.no_hp}
            onChange={(e) => handleChange("no_hp", e.target.value)}
          />
        </div>

        {/* 🔹 Instansi */}
        <div>
          <Label className="mb-2">Instansi</Label>
          <Select
            value={form.instansi_id > 0 ? String(form.instansi_id) : undefined} // ✅ Hanya set value jika valid
            onValueChange={(v) => handleChange("instansi_id", Number(v))}
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

        {/* 🔹 Unit kerja */}
        <div>
          <Label className="mb-2">Unit Kerja</Label>
          <Select
            value={form.unit_id > 0 ? String(form.unit_id) : undefined} // ✅ Hanya set value jika valid
            onValueChange={(v) => handleChange("unit_id", Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Unit Kerja" />
            </SelectTrigger>
            <SelectContent>
              {unitData
                ?.filter((u: any) => u.instansi_id === form.instansi_id)
                .map((u: any) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.nama_unit}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        Update Pegawai
      </Button>
    </form>
  );
}