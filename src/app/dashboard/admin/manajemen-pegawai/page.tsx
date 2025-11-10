// src/app/(dashboard)/admin/manajemen-pegawai/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "@/types/database";
import ManajemenPegawaiTable from "./manajemen-pegawai-table";

async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

async function getAllPegawai(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("nama", { ascending: true });

  if (error) {
    console.error("Error fetching all pegawai:", error);
    return [];
  }

  return data;
}

export default async function ManajemenPegawaiPage() {
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

  const dataPegawai = await getAllPegawai();

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Manajemen Data Pegawai</h1>
      <p className="mb-8 text-gray-600">
        Kelola data profil, akun, dan role untuk semua pegawai Kemenham.
      </p>

      <ManajemenPegawaiTable dataPegawai={dataPegawai} />
    </div>
  );
}
