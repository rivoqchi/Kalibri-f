"use client"

import * as React from "react"

import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import { verifyTelegramWebApp } from "@/lib/api/auth"
import { useAuthStore } from "@/lib/auth/store"

/**
 * When opened inside Telegram Mini App, exchange initData for a JWT session.
 * Phone is not required — backend upserts from Telegram identity.
 */
export function TelegramWebAppAuth() {
  const hydrated = useAuthHydrated()
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const tried = React.useRef(false)

  React.useEffect(() => {
    if (!hydrated || token || tried.current) return
    const webApp = window.Telegram?.WebApp
    const initData = webApp?.initData?.trim()
    if (!initData) return
    tried.current = true
    webApp?.ready?.()
    verifyTelegramWebApp(initData)
      .then(({ token: sessionToken, user }) => {
        setSession(sessionToken, user)
      })
      .catch(() => {
        /* keep tried — avoid retry loop; login page can still auth */
      })
  }, [hydrated, token, setSession])

  return null
}
