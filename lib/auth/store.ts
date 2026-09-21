"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "user" | "admin" | "super_admin";
  fullName: string;
  photoUrl?: string | null;
  photoCustom?: boolean;
  photoRevision?: number;
  isBlocked?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clearSession: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
      isAdmin: () => {
        const role = get().user?.role;
        return role === "admin" || role === "super_admin";
      },
      isSuperAdmin: () => get().user?.role === "super_admin",
    }),
    {
      name: "kalibri-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
