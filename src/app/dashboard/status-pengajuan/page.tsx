// src/app/(dashboard)/status-pengajuan/page.tsx

import StatusTable from "./status-table";

export default async function StatusPengajuanPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <h1 className="mb-6 text-3xl font-bold">Status Pengajuan Saya</h1>
      <p className="mb-8 text-gray-600">
        Pantau status semua pengajuan cuti dan dinas Anda di halaman ini.
      </p>

      <StatusTable />
    </div>
  );
}
