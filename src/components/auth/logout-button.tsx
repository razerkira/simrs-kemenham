// src/components/auth/logout-button.tsx

"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    // await supabase.auth.signOut()
    await logout();
    router.push("/login");
  };

  return (
    <Button variant="destructive" onClick={handleLogout}>
      Logout
    </Button>
  );
}
