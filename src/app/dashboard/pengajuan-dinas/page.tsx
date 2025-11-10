// src/app/(dashboard)/pengajuan-dinas/page.tsx
import DinasForm from './dinas-form' // Akan kita buat nanti

export default function PengajuanDinasPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Formulir Pengajuan Dinas Luar</h1>
      <p className="mb-8 text-gray-600">
        Isi formulir di bawah ini untuk mengajukan perjalanan dinas. 
        Pastikan tanggal dan jam sudah benar.
      </p>
      
      <DinasForm />
    </div>
  )
}