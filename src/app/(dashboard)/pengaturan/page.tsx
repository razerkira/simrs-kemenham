// src/app/(dashboard)/pengaturan/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "./settings-form";
import { Profile } from "@/types/database";

export default async function PengaturanPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile for settings", error);
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold">Pengaturan Akun</h1>
      <p className="mb-8 text-gray-600">
        Perbarui data diri dan informasi kepegawaian Anda di sini.
      </p>

      <SettingsForm profile={profile} />
    </div>
  );
}
