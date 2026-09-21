"use client"

import { useEffect } from "react"

import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import { useCartStore } from "@/hooks/use-cart"
import { useAuthStore } from "@/lib/auth/store"

/** Loads cart from API after auth hydrate; reloads on login/logout. */
export function CartSync() {
  const authReady = useAuthHydrated()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!authReady) return
    void useCartStore.getState().hydrateFromApi()
  }, [authReady, token])

  return null
}
