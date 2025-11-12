import { UserProfile } from "@/types/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: number;
  status_aktif?: number;
  last_login?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  isRehydrated?: boolean; // ✅ Tambah flag
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.isRehydrated = true; // 🔹 Setelah rehydrate
      },
    }
  )
);
