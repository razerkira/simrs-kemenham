"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Send, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth";
import { CutiFormValues, cutiSchema } from "./validation";

export default function CutiForm() {
  const { user } = useAuthStore();
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
      if (!user) throw new Error("User belum login.");

      const formData = new FormData();
      formData.append("pegawai_id", String(user?.id));
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
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }
    submitCuti();
  };
  return (
    <div className="px-4">
      {/* <Toaster /> */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Form Pengajuan Cuti
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIP */}
            {/* <div className="space-y-2">
              <label htmlFor="nip" className="text-sm font-medium">
                NIP
              </label>
              <input
                id="nip"
                value={user?.nip ?? ""}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-700"
              />
            </div> */}

            {/* Nama */}
            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Lengkap
              </label>
              <input
                id="nama"
                value={user?.name ?? ""}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* Jenis Cuti */}
            <div className="space-y-2">
              <label htmlFor="jenisCuti" className="text-sm font-medium">
                Jenis Cuti *
              </label>
              <select
                id="jenisCuti"
                value={jenisCuti}
                onChange={(e) => setJenisCuti(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                <label htmlFor="tanggalMulai" className="text-sm font-medium">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  id="tanggalMulai"
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
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tanggalSelesai" className="text-sm font-medium">
                  Tanggal Selesai *
                </label>
                <input
                  type="date"
                  id="tanggalSelesai"
                  required
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  min={tanggalMulai || todayWIB}
                  max={maxDate}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2">
              <label htmlFor="alasan" className="text-sm font-medium">
                Keterangan *
              </label>
              <textarea
                id="alasan"
                required
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan pengajuan cuti Anda"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <label htmlFor="dataDukung" className="text-sm font-medium">
                Lampiran (PDF/Gambar)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="dataDukung"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="dataDukung"
                  className="flex items-center justify-center w-full h-10 px-3 py-2 text-sm border border-input rounded-md cursor-pointer hover:bg-accent transition"
                >
                  <Upload className="mr-2 h-4 w-4" /> Pilih file (PDF/Gambar)
                </label>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground mt-1">
                  File dipilih: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-11 rounded-md px-8 w-full disabled:bg-gray-400"
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
