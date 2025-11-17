"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { CutiFormValues, cutiSchema } from "./validation";

export default function CutiForm() {
  const { user } = useAuthStore();

  // === Fetch pegawai dari API /user/me === //
  const { data: meData, isLoading: meLoading, error: meError } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/user/me");
      return res.data.user;
    },
  });

  const pegawaiId = meData?.pegawai?.id ?? null;

  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jenisCuti, setJenisCuti] = useState("");

  const todayWIB = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { mutate: submitCuti, isPending } = useMutation({
    mutationFn: async () => {
      if (!pegawaiId) throw new Error("Gagal mendapatkan pegawai_id dari API.");

      const formData = new FormData();
      formData.append("pegawai_id", String(pegawaiId));
      formData.append("tanggal_mulai", tanggalMulai);
      formData.append("tanggal_selesai", tanggalSelesai);
      formData.append("keterangan", alasan);
      formData.append("jenis_cuti", jenisCuti);
      if (file) formData.append("lampiran", file);

      const res = await api.post("/api/v1/cuti/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    },
    onSuccess: () => {
      toast.success("Pengajuan cuti berhasil dikirim!");
      setTanggalMulai("");
      setTanggalSelesai("");
      setAlasan("");
      setJenisCuti("");
      setFile(null);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Gagal mengirim pengajuan cuti."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Lampiran wajib diunggah.");
      return;
    }

    const formValues: CutiFormValues = {
      jenis_cuti: jenisCuti,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      alasan,
      file: file ?? undefined,
    };

    const result = cutiSchema.safeParse(formValues);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    submitCuti();
  };

  return (
    <div className="px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Form Pengajuan Cuti
          </h1>

          {/* Jika data me belum siap */}
          {meLoading && <p className="text-sm text-gray-500 mb-4">Memuat data...</p>}
          {meError && <p className="text-sm text-red-500 mb-4">Gagal mengambil data pegawai.</p>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <input
                value={user?.name ?? ""}
                disabled
                className="flex h-10 w-full rounded-md border bg-gray-100 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* Jenis Cuti */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Cuti *</label>
              <select
                value={jenisCuti}
                onChange={(e) => setJenisCuti(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Pilih Jenis Cuti</option>
                <option value="Sakit">Cuti Sakit</option>
                <option value="Melahirkan">Cuti Melahirkan</option>
                <option value="Tahunan">Cuti Tahunan</option>
                <option value="Penting">Cuti Penting</option>
                <option value="Lainnya">Cuti Lainnya</option>
              </select>
            </div>

            {/* Tanggal */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Mulai *</label>
                <input
                  type="date"
                  required
                  value={tanggalMulai}
                  onChange={(e) => {
                    setTanggalMulai(e.target.value);
                    if (tanggalSelesai && e.target.value > tanggalSelesai) {
                      setTanggalSelesai("");
                    }
                  }}
                  min={todayWIB}
                  max={maxDate}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Selesai *</label>
                <input
                  type="date"
                  required
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  min={tanggalMulai || todayWIB}
                  max={maxDate}
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Keterangan *</label>
              <textarea
                required
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            {/* Lampiran */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lampiran (PDF/Gambar)</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  id="dataDukung"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="dataDukung"
                  className="flex items-center justify-center w-full h-10 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="mr-2 h-4 w-4" /> Pilih File
                </label>
              </div>

              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  File dipilih: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending || !pegawaiId}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-11 w-full rounded-md px-8"
            >
              <Send className="mr-2 h-5 w-5" />
              {isPending ? "Mengirim..." : "Kirim Pengajuan Cuti"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
