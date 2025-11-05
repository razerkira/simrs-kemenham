"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Send, Upload, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";

type Pegawai = {
  nip: string;
  nama: string;
};

export default function DinasForm() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([
    { nip: "", nama: "" },
  ]);
  const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]); // untuk tiap pegawai
  const [kegiatan, setKegiatan] = useState("");
  const [jenis, setJenis] = useState<"full" | "half">("full");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Dummy data unit kerja kasubag
  const dummyPegawaiUnit: Pegawai[] = [
    { nip: "196823457869", nama: "Andi Permana" },
    { nip: "197024561423", nama: "Budi Santoso" },
    { nip: "198032145245", nama: "Siti" },
    { nip: "199912345678", nama: "Rina" },
    { nip: "199123456789", nama: "Agus" },
  ];

  const handleAddPegawai = () => {
    setPegawaiList([...pegawaiList, { nip: "", nama: "" }]);
    setPopoverOpen([...popoverOpen, false]); // tambah popover state
  };

  const handleRemovePegawai = (index: number) => {
    setPegawaiList(pegawaiList.filter((_, i) => i !== index));
    setPopoverOpen(popoverOpen.filter((_, i) => i !== index));
  };

  const handleSelectPegawai = (index: number, pegawai: Pegawai) => {
    const updated = [...pegawaiList];
    updated[index] = pegawai;
    setPegawaiList(updated);

    const updatedOpen = [...popoverOpen];
    updatedOpen[index] = false; // tutup popover
    setPopoverOpen(updatedOpen);
  };

  const handleChangeInput = (index: number, value: string) => {
    const updated = [...pegawaiList];
    updated[index] = { nip: "", nama: value };
    setPegawaiList(updated);

    const updatedOpen = [...popoverOpen];
    updatedOpen[index] = true; // buka popover saat mengetik
    setPopoverOpen(updatedOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      pegawaiList.some((p) => !p.nip || !p.nama) ||
      !kegiatan ||
      !mulai ||
      !selesai ||
      !file
    ) {
      toast.error("Harap isi semua field wajib.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Pengajuan perjalanan dinas berhasil dikirim (dummy)");
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <Link href="/beranda">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Form Pengajuan Perjalanan Dinas
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan isi formulir perjalanan dinas untuk pegawai unit Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multiple Pegawai */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Pegawai *</label>
              {pegawaiList.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center relative">
                  <Popover.Root
                    open={popoverOpen[idx]}
                    onOpenChange={(open) => {
                      const updated = [...popoverOpen];
                      updated[idx] = open;
                      setPopoverOpen(updated);
                    }}
                  >
                    <Popover.Trigger asChild>
                      <input
                        type="text"
                        placeholder="Cari NIP - Nama"
                        value={
                          p.nip && p.nama ? `${p.nip} - ${p.nama}` : p.nama
                        }
                        onChange={(e) => handleChangeInput(idx, e.target.value)}
                        className="flex-1 h-10 rounded-md border border-input px-3 py-2 text-sm"
                      />
                    </Popover.Trigger>

                    <Popover.Portal>
                      <Popover.Content
                        className="bg-white shadow-md rounded-md mt-1 max-h-60 overflow-auto w-full z-50 p-1"
                        side="bottom"
                        align="start"
                        sideOffset={5}
                        avoidCollisions
                      >
                        {dummyPegawaiUnit
                          .filter((dp) =>
                            `${dp.nip} - ${dp.nama}`
                              .toLowerCase()
                              .includes((p.nama || "").toLowerCase())
                          )
                          .map((dp) => (
                            <div
                              key={dp.nip}
                              className="px-3 py-2 cursor-pointer hover:bg-blue-100 rounded-md"
                              onClick={() => handleSelectPegawai(idx, dp)}
                            >
                              {dp.nip} - {dp.nama}
                            </div>
                          ))}
                        {dummyPegawaiUnit.filter((dp) =>
                          `${dp.nip} - ${dp.nama}`
                            .toLowerCase()
                            .includes((p.nama || "").toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-gray-400">
                            Tidak ditemukan
                          </div>
                        )}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                  {pegawaiList.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemovePegawai(idx)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={handleAddPegawai}>
                <Plus className="mr-2 h-4 w-4" /> Tambah Pegawai
              </Button>
            </div>

            {/* Kegiatan */}
            <div className="space-y-2">
              <label htmlFor="kegiatan" className="text-sm font-medium">
                Deskripsi Kegiatan *
              </label>
              <textarea
                id="kegiatan"
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>

            {/* Jenis Perjalanan */}
            <div className="space-y-2">
              <label htmlFor="jenis" className="text-sm font-medium">
                Jenis Perjalanan *
              </label>
              <select
                id="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as "full" | "half")}
                className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="full">Full</option>
                <option value="half">Half</option>
              </select>
            </div>

            {/* Tanggal & Jam */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="mulai" className="text-sm font-medium">
                  Waktu Mulai *
                </label>
                <input
                  type="datetime-local"
                  id="mulai"
                  value={mulai}
                  onChange={(e) => setMulai(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="selesai" className="text-sm font-medium">
                  Waktu Selesai *
                </label>
                <input
                  type="datetime-local"
                  id="selesai"
                  value={selesai}
                  onChange={(e) => setSelesai(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                Dokumen Pendukung *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label
                  htmlFor="file"
                  className="flex items-center justify-center w-full h-10 px-3 py-2 text-sm border border-input rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="mr-2 h-4 w-4" /> Pilih file (PDF/Gambar)
                </label>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center w-full h-11 px-8 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send className="mr-2 h-5 w-5" />{" "}
              {loading ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
