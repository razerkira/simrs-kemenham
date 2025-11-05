"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Send, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CutiForm() {
  const [nip, setNip] = useState("");
  const [nama, setNama] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [nipValid, setNipValid] = useState(false);

  // 🔹 Simulasi cek NIP
  const handleCekNip = () => {
    if (nip.trim() === "") {
      toast.error("Harap masukkan NIP terlebih dahulu.");
      return;
    }

    // Dummy data
    if (nip === "123456789") {
      setNama("Budi Santoso");
      setNipValid(true);
      toast.success("Data pegawai ditemukan!");
    } else {
      setNama("");
      setNipValid(false);
      toast.error("NIP tidak ditemukan!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nipValid) {
      toast.error("NIP belum valid, harap cek terlebih dahulu.");
      return;
    }
    if (!tanggalMulai || !tanggalSelesai || !alasan) {
      toast.error("Harap isi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Pengajuan cuti berhasil dikirim (dummy)");
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <Toaster />
      <div className="max-w-2xl mx-auto">
        <Link href="/beranda">
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
                    setNipValid(false);
                    setNama("");
                  }}
                  required
                  placeholder="Masukkan NIP Anda"
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCekNip}
                  className="whitespace-nowrap"
                >
                  <Search className="mr-2 h-4 w-4" /> Cek NIP
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
                value={nama}
                readOnly
                placeholder="Otomatis terisi setelah cek NIP"
                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {/* Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tanggalMulai" className="text-sm font-medium">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  id="tanggalMulai"
                  required
                  disabled={!nipValid}
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                  disabled={!nipValid}
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Alasan */}
            <div className="space-y-2">
              <label htmlFor="alasan" className="text-sm font-medium">
                Alasan *
              </label>
              <textarea
                id="alasan"
                required
                disabled={!nipValid}
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Jelaskan alasan pengajuan Anda"
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="dataDukung" className="text-sm font-medium">
                Data Pendukung
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="dataDukung"
                  accept=".pdf,image/*"
                  disabled={!nipValid}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="dataDukung"
                  className={`flex items-center justify-center w-full h-10 px-3 py-2 text-sm border border-input rounded-md cursor-pointer transition ${
                    nipValid
                      ? "hover:bg-accent"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Upload className="mr-2 h-4 w-4" /> Pilih file (PDF/Gambar)
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                File akan disimpan setelah integrasi backend diaktifkan.
              </p>
            </div>

            {/* Tombol Submit */}
            <Button
              type="submit"
              disabled={!nipValid || loading}
              className="inline-flex items-center justify-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-11 rounded-md px-8 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="mr-2 h-5 w-5" />{" "}
              {loading ? "Mengirim..." : "Kirim Pengajuan Cuti"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
