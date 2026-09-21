"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import {
  clearScrollRestorePending,
  currentStorePath,
  isScrollRestorePending,
  markScrollRestorePending,
  readStoreScroll,
  saveStoreScroll,
} from "@/lib/store-scroll"

/**
 * Next App Router scrolls to top on history back. Persist scrollY per path and
 * restore only when a pending restore was marked (popstate / ProductTopBar).
 * Pagination (`?page=`) uses default scroll-to-top; product detail back restores.
 */
export function StoreScrollRestoration() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const pathKey = `${pathname}${search ? `?${search}` : ""}`
  const pathRef = useRef(pathKey)

  useEffect(() => {
    const onPopState = () => markScrollRestorePending()
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  useEffect(() => {
    pathRef.current = currentStorePath()
    const onScroll = () => saveStoreScroll(pathRef.current)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      saveStoreScroll(pathRef.current)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pathKey])

  useLayoutEffect(() => {
    if (!isScrollRestorePending()) return

    const path = currentStorePath()
    const y = readStoreScroll(path)
    if (y == null) {
      clearScrollRestorePending()
      return
    }

    const restore = () => {
      window.scrollTo({ top: y, left: 0, behavior: "auto" })
    }

    restore()
    const raf = requestAnimationFrame(restore)
    const t0 = window.setTimeout(restore, 0)
    const t1 = window.setTimeout(restore, 50)
    const t2 = window.setTimeout(restore, 120)
    // Clear after Next's own scroll-to-top; keep flag through Strict remounts.
    const done = window.setTimeout(() => clearScrollRestorePending(), 160)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(done)
    }
  }, [pathKey])

  return null
}
