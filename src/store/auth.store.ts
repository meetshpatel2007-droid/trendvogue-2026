"use client";

import { create } from "zustand";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "USER" | "ADMIN";
  isBlocked: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isLoading: true,
  isHydrated: false,

  setUser: (user) => set({ user, isLoading: false, isHydrated: true }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false, isHydrated: true });
      } else {
        set({ user: null, isLoading: false, isHydrated: true });
      }
    } catch {
      set({ user: null, isLoading: false, isHydrated: true });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    set({ user: null });
  },
}));
