"use client"

import { useEffect } from "react"

import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import { useFavoritesStore } from "@/hooks/use-favorites"
import { useAuthStore } from "@/lib/auth/store"

/** Loads favorites from API after auth hydrate; reloads on login/logout. */
export function FavoritesSync() {
  const authReady = useAuthHydrated()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!authReady) return
    void useFavoritesStore.getState().hydrateFromApi()
  }, [authReady, token])

  return null
}
