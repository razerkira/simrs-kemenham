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

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
          console.error('Error fetching session:', sessionError);
          router.push('/login');
          return; 
      }
      if (!session) {
          console.log('No active session found, redirecting to login.');
          router.push('/login');
          return; 
      }

      setUser(session.user);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching profile or profile not found:', profileError);
        setUser(null);
        setProfile(null);
        setLoading(false); 
        router.push('/login?error=Profile%20fetch%20failed'); 
        return;
      }

      setProfile(profileData as Profile);
      setLoading(false); 
    };

    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null); 
        setProfile(null);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user); 
        fetchData(); 
      }
      else if (event === 'TOKEN_REFRESHED' && !session) {
         setUser(null);
         setProfile(null);
         router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]); 


  if (loading || !profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat data... 
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        profile={profile}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />

      <div className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-16" : "ml-64"
        )}>
        <Header profile={profile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}