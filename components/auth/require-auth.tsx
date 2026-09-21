"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import { useAuthStore } from "@/lib/auth/store"

export function RequireAuth({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((state) => state.token)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!hydrated || token) return
    const next = pathname.startsWith("/") ? pathname : "/profile"
    router.replace(`/login?next=${encodeURIComponent(next)}`)
  }, [hydrated, token, pathname, router])

  if (!hydrated || !token) return null

  return children
}
