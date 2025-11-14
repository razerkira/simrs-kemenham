"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./_components/sidebar";
import Header from "./_components/header";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/axios";
import { Profile, UserProfile } from "@/types/database";

export default function DashboardLayout({
  children,
}: /*************  ✨ Windsurf Command ⭐  *************/
/**
 * A layout component for the dashboard pages.
 * 
 * @param {React.ReactNode} children - The children of the component.
 * 
 * @returns {JSX.Element} - The component.
 * 
 * @example
 * 
/*******  12292d77-3f5c-4d72-9af6-4ca535bfef04  *******/ {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, login, logout, isRehydrated } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | Profile | null>(user ?? null);
  const [loading, setLoading] = useState(true);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    const checkAuth = async () => {
      // Tunggu Zustand selesai rehydrate
      if (!isRehydrated) return;

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!user) {
        try {
          const res = await api.get("/api/v1/profile"); // Laravel endpoint
          login(res.data.user, token);
          setProfile(res.data.user);
        } catch (err) {
          console.error("Gagal mengambil profil:", err);
          logout();
          router.replace("/login");
          return;
        }
      } else {
        setProfile(user);
      }

      setLoading(false);
    };

    checkAuth();
  }, [isRehydrated, token, user, login, logout, router]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Memuat data pengguna...
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
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <Header profile={profile} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
