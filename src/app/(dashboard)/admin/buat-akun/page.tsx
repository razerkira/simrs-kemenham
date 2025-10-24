// src/app/(dashboard)/admin/buat-akun/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database";
import BuatAkunForm from "./buat-akun-form";

async function getUserProfile(
  userId: string
): Promise<Pick<Profile, "role"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export default async function BuatAkunPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userProfile = await getUserProfile(session.user.id);
  if (userProfile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Buat Akun Pegawai Baru</h1>
      <p className="mb-8 text-gray-600">
        Masukkan data pegawai baru di bawah ini. Akun akan langsung aktif.
        Pastikan email belum terdaftar.
      </p>

      <BuatAkunForm />
    </div>
  );
}
