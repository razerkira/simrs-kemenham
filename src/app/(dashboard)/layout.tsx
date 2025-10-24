// src/app/(dashboard)/layout.tsx

"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Sidebar from './_components/sidebar'
import Header from './_components/header'
import { Profile } from '@/types/database'
import { User } from '@supabase/supabase-js'
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const supabase = createClient();

  // State untuk user profile & loading
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // State Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Efek untuk mengambil data user & profile saat komponen dimuat
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Ambil data sesi
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // --- PERBAIKAN UTAMA DI SINI ---
      // Redirect HANYA jika ada error atau jika session eksplisit null SETELAH pengecekan selesai
      if (sessionError) {
          console.error('Error fetching session:', sessionError);
          router.push('/login');
          return; // Hentikan jika ada error
      }
      if (!session) {
          // Jika TIDAK ada session (setelah Supabase selesai memeriksa), baru redirect
          console.log('No active session found, redirecting to login.');
          router.push('/login');
          return; // Hentikan jika tidak ada sesi
      }
      // --- SELESAI PERBAIKAN ---

      // Jika session ADA, lanjutkan ambil profile
      setUser(session.user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile or profile not found:', profileError);
        // Hapus user yang mungkin sudah di-set jika profile gagal diambil
        setUser(null);
        setProfile(null);
        setLoading(false); // Tetap set loading false
        router.push('/login?error=Profile%20fetch%20failed'); // Redirect jika profile gagal
        return;
      }

      setProfile(profileData as Profile);
      setLoading(false); // Selesai loading HANYA jika semua berhasil
    };

    fetchData();

    // Listener (tidak berubah)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null); // Clear user state on sign out
        setProfile(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        // Jika login baru terjadi di tab ini, muat ulang data
        setUser(session.user); // Langsung set user dari event
        fetchData(); // Panggil lagi untuk profile
      }
      // Tambahkan penanganan jika token refresh gagal (opsional tapi bagus)
      else if (event === 'TOKEN_REFRESHED' && !session) {
         setUser(null);
         setProfile(null);
         router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]); // Hapus fetchData dari dependencies jika ESLint mengeluh


  // Tampilkan loading state jika data belum siap
  if (loading || !profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat data... {/* Ganti dengan spinner jika mau */}
      </div>
    );
  }

  // Jika data sudah siap, render layout
  return (
    <div className="flex min-h-screen">
      {/* Kirim state & toggle function ke Sidebar */}
      <Sidebar
        profile={profile}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Konten Utama (Header + Main) */}
      <div className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-16" : "ml-64"
        )}>
        {/* Header menerima profile DAN fungsi toggle */}
        <Header profile={profile} toggleSidebar={toggleSidebar} />

        {/* Konten Halaman */}
        <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}