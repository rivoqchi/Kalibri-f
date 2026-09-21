"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import { ApiError } from "@/lib/api/client"
import { fetchAdminPanel } from "@/lib/api/admin"
import { fetchAuthMe } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/auth/store"

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.user?.role)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!hydrated || token) return
    const next = pathname.startsWith("/") ? pathname : "/admin"
    router.replace(`/login?next=${encodeURIComponent(next)}`)
  }, [hydrated, token, pathname, router])

  useEffect(() => {
    if (!hydrated || !token) return
    let cancelled = false
    ;(async () => {
      try {
        const me = await fetchAuthMe(token)
        if (cancelled) return
        setSession(token, me)
        if (me.role !== "super_admin") {
          router.replace("/profile")
          return
        }
        await fetchAdminPanel(token)
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearSession()
          return
        }
        router.replace("/profile")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hydrated, token, setSession, clearSession, router])

  if (!hydrated || !token || role !== "super_admin") return null

  return children
}
