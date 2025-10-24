// src/app/(dashboard)/pengajuan-cuti/page.tsx
import CutiForm from "./cuti-form";

export default function PengajuanCutiPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Formulir Pengajuan Izin Cuti</h1>
      <p className="mb-8 text-gray-600">
        Isi formulir di bawah ini untuk mengajukan izin cuti. Pastikan tanggal
        yang Anda pilih sudah benar.
      </p>

      <CutiForm />
    </div>
  );
}
