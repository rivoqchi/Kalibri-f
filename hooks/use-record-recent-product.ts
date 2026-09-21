"use client"

import * as React from "react"

import { recordSearchRecentProduct } from "@/lib/api/search"
import { useAuthStore } from "@/lib/auth/store"

/** Persist product view for search-panel recent cards. */
export function useRecordRecentProduct(productId: string | undefined) {
  const token = useAuthStore((s) => s.token)

  React.useEffect(() => {
    if (!productId) return
    void recordSearchRecentProduct(token, productId).catch(() => undefined)
  }, [productId, token])
}
