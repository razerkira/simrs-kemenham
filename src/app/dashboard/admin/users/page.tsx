import UserTable from "./users-table";

export default function UsersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Data User</h1>
          <p className="text-gray-600">
            Kelola data profil, akun, dan role untuk seluruh pegawai Kemenham.
          </p>
        </div>
      </div>

      <UserTable />
    </div>
  );
}
