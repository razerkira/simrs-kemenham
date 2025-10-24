// src/app/(dashboard)/layout.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import { Profile } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile, error } = await (await supabase)
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    console.error("Error fetching profile:", error);
    redirect("/login?error=Profile not found");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile} />

      <div className="flex flex-1 flex-col">
        <Header profile={profile} />

        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
