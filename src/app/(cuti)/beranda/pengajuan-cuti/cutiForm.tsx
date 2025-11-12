"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Send, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/axios";

interface Pegawai {
  id: number;
  nip: string;
  nama: string;
  jabatan: string;
  email: string;
  instansi_id: number;
  unit_id: number;
}

export default function CutiForm() {
  const [nip, setNip] = useState("");
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jenisCuti, setJenisCuti] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const {
    data: dataPegawai,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["ceknip", nip],
    queryFn: async () => {
      const res = await api.get(`/api/v1/ceknip?search=${nip}`);
      return res.data;
    },
    enabled: false,
  });

  const handleCekNip = async () => {
    if (!nip.trim()) {
      toast.error("Harap masukkan NIP terlebih dahulu.");
      return;
    }

    setSearchTriggered(true);
    try {
      const { data } = await refetch();
      if (data?.data?.length > 0) {
        setPegawai(data.data[0]);
        toast.success("Data pegawai ditemukan!");
      } else {
        setPegawai(null);
        toast.error("NIP tidak ditemukan!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mencari NIP.");
    }
  };

  const { mutate: submitCuti, isPending } = useMutation({
    mutationFn: async () => {
      if (!pegawai) throw new Error("Pegawai belum valid.");
      const formData = new FormData();
      formData.append("pegawai_id", String(pegawai.id));
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
      setPegawai(null);
      setNip("");
      setTanggalMulai("");
      setTanggalSelesai("");
      setAlasan("");
      setJenisCuti("");
      setFile(null);
      setSearchTriggered(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Gagal mengirim pengajuan cuti."
      );
    },
  });

  // ✅ Hitung tanggal hari ini dalam zona WIB (GMT+7)
  const todayWIB = new Date(Date.now() + 7 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // ✅ Hitung max 1 tahun ke depan
  const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!pegawai) {
      toast.error("Harap cek NIP terlebih dahulu!");
      return;
    }
    if (!tanggalMulai || !tanggalSelesai || !alasan || !jenisCuti) {
      toast.error("Harap isi semua field yang wajib diisi.");
      return;
    }

    // ✅ Validasi tanggal (WIB)
    const now = new Date();
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const start = new Date(`${tanggalMulai}T00:00:00+07:00`);
    const end = new Date(`${tanggalSelesai}T23:59:59+07:00`);

    if (start < new Date(wibNow.toDateString())) {
      toast.error("Tanggal mulai cuti tidak boleh sebelum hari ini (WIB).");
      return;
    }

    if (end < start) {
      toast.error("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }

    const durasi = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
    if (durasi > 30) {
      toast.error("Durasi cuti tidak boleh lebih dari 30 hari.");
      return;
    }

    submitCuti();
  };

  return (
    <div className="px-4">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <Link href="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Form Pengajuan Cuti
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan isi formulir di bawah ini dengan lengkap dan benar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIP */}
            <div className="space-y-2">
              <label htmlFor="nip" className="text-sm font-medium">
                NIP *
              </label>
              <div className="flex gap-2">
                <input
                  id="nip"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                    setPegawai(null);
                  }}
                  required
                  placeholder="Masukkan NIP Anda"
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCekNip}
                  disabled={isFetching}
                  className="whitespace-nowrap"
                >
                  {isFetching ? (
                    "Mencari..."
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Cek NIP
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Nama */}
            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Lengkap *
              </label>
              <input
                id="nama"
                value={pegawai?.nama ?? ""}
                readOnly
                placeholder="Otomatis terisi setelah cek NIP"
                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-700"
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
                disabled={!pegawai}
                required
                className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  disabled={!pegawai}
                  value={tanggalMulai}
                  onChange={(e) => {
                    setTanggalMulai(e.target.value);
                    if (tanggalSelesai && e.target.value > tanggalSelesai) {
                      setTanggalSelesai("");
                    }
                  }}
                  min={todayWIB}
                  max={maxDate}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  disabled={!pegawai}
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  min={tanggalMulai || todayWIB}
                  max={maxDate}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                disabled={!pegawai}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan pengajuan cuti Anda"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  disabled={!pegawai}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="dataDukung"
                  className={`flex items-center justify-center w-full h-10 px-3 py-2 text-sm border border-input rounded-md cursor-pointer transition ${
                    pegawai
                      ? "hover:bg-accent"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
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

            <Button
              type="submit"
              disabled={!pegawai || isPending}
              className="inline-flex items-center justify-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-11 rounded-md px-8 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="mr-2 h-5 w-5" />{" "}
              {isPending ? "Mengirim..." : "Kirim Pengajuan Cuti"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
