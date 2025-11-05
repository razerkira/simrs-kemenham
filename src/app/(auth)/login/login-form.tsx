// src/app/(auth)/login/login-form.tsx

"use client";

import { createClient } from "@/utils/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        router.push("/");
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        variables: {
          default: {
            colors: {
              // Warna utama untuk tombol submit (biru yang lebih cerah)
              brand: "#2563EB",
              // Warna hover (biru yang sedikit lebih gelap)
              brandAccent: "#1D4ED8",
            },
          },
        },
      }}
      theme="light"
      providers={[]}
      redirectTo={`${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`}
      socialLayout="horizontal"
      showLinks={true}
    />
  );
}
