"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { ArrowLeft, Send, Upload, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import api from "@/lib/axios";

type Pegawai = {
  id: number;
  nip: string;
  nama: string;
};

export default function DinasForm() {
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([
    { id: 0, nip: "", nama: "" },
  ]);
  const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
  const [kegiatan, setKegiatan] = useState("");
  const [jenis, setJenis] = useState<"FULL" | "HALF">("FULL");
  const [mulai, setMulai] = useState("");
  const [selesai, setSelesai] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // --- FETCH PEGAWAI DARI API ---
  const { data: pegawaiOptions = [], isLoading: loadingPegawai } = useQuery({
    queryKey: ["pegawai"],
    queryFn: async (): Promise<Pegawai[]> => {
      try {
        const res = await api.get("/api/v1/pegawai");
        return res.data.data.map((p: any) => ({
          id: p.id,
          nip: p.nip,
          nama: p.nama,
        }));
      } catch (error) {
        console.warn("Gagal fetch API, gunakan dummy data");
        return [
          { id: 2, nip: "123456789", nama: "Admin" },
          { id: 3, nip: "987654321", nama: "Pegawai" },
          { id: 4, nip: "1122334455", nama: "Rina" },
        ];
      }
    },
  });

  // --- SUBMIT PENGAJUAN DINAS ---
  const { mutate: submitDinas, isPending: loadingSubmit } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/api/v1/perjalanan/store", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Pengajuan perjalanan dinas berhasil dikirim!");
      setPegawaiList([{ id: 0, nip: "", nama: "" }]);
      setPopoverOpen([false]);
      setKegiatan("");
      setJenis("FULL");
      setMulai("");
      setSelesai("");
      setFile(null);
    },
    onError: (error: AxiosError) => {
      console.error(error);
      toast.error("Gagal mengirim pengajuan (dummy mode).");
    },
  });

  // --- EVENT HANDLERS ---
  const handleAddPegawai = () => {
    setPegawaiList([...pegawaiList, { id: 0, nip: "", nama: "" }]);
    setPopoverOpen([...popoverOpen, false]);
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
    updatedOpen[index] = false;
    setPopoverOpen(updatedOpen);
  };

  const handleChangeInput = (index: number, value: string) => {
    const updated = [...pegawaiList];
    updated[index] = { id: 0, nip: "", nama: value };
    setPegawaiList(updated);
    const updatedOpen = [...popoverOpen];
    updatedOpen[index] = true;
    setPopoverOpen(updatedOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      pegawaiList.some((p) => !p.id) ||
      !kegiatan ||
      !mulai ||
      !selesai ||
      !file
    ) {
      toast.error("Harap isi semua field wajib.");
      return;
    }

    // Validasi tanggal
    if (new Date(mulai) > new Date(selesai)) {
      toast.error(
        "Tanggal mulai tidak boleh lebih besar dari tanggal selesai."
      );
      return;
    }

    const formData = new FormData();
    pegawaiList.forEach((p) => formData.append("pegawai_id[]", String(p.id)));
    formData.append("tanggal_berangkat", mulai);
    formData.append("tanggal_kembali", selesai);
    formData.append("keterangan", kegiatan);
    formData.append("is_full", jenis);
    formData.append("lampiran", file);

    submitDinas(formData);
  };

  return (
    <div className="px-4">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Form Pengajuan Dinas Luar
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* PEGAWAI MULTIPLE */}
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
                        placeholder={
                          loadingPegawai
                            ? "Memuat pegawai..."
                            : "Cari NIP - Nama"
                        }
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
                      >
                        {pegawaiOptions
                          .filter((dp) =>
                            `${dp.nip} - ${dp.nama}`
                              .toLowerCase()
                              .includes((p.nama || "").toLowerCase())
                          )
                          .map((dp) => (
                            <div
                              key={dp.id}
                              className="px-3 py-2 cursor-pointer hover:bg-blue-100 rounded-md"
                              onClick={() => handleSelectPegawai(idx, dp)}
                            >
                              {dp.nip} - {dp.nama}
                            </div>
                          ))}
                        {pegawaiOptions.filter((dp) =>
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

            {/* KEGIATAN */}
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

            {/* JENIS */}
            <div className="space-y-2">
              <label htmlFor="jenis" className="text-sm font-medium">
                Jenis Perjalanan *
              </label>
              <select
                id="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value as "FULL" | "HALF")}
                className="w-full h-10 rounded-md border border-input px-3 py-2 text-sm"
              >
                <option value="FULL">Full</option>
                <option value="HALF">Half</option>
              </select>
            </div>

            {/* WAKTU */}
            <div className="grid lg:grid-cols-2 gap-4">
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

            {/* FILE */}
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
                  <Upload className="mr-2 h-4 w-4" />{" "}
                  {file ? file.name : "Pilih file (PDF/Gambar)"}
                </label>
              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loadingSubmit}
              className="inline-flex items-center justify-center w-full h-11 px-8 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <Send className="mr-2 h-5 w-5" />
              {loadingSubmit ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
