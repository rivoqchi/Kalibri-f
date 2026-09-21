"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconHeart,
  IconLayoutGrid,
  IconPhone,
  IconSearch,
  IconShoppingCart,
  IconUser,
} from "@tabler/icons-react"

import { useCatalog } from "@/components/store/catalog-context"
import { SearchPanel } from "@/components/store/search-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/hooks/use-cart"
import { recordSearchHistory } from "@/lib/api/search"
import { useAuthStore } from "@/lib/auth/store"
import {
  STORE_LOGO_SRC,
  STORE_PHONE,
  STORE_PHONE_TEL,
} from "@/lib/store-config"

const glassNav =
  "bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"

export function StoreNavbar() {
  const { setOpen } = useCatalog()
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  )
  const [query, setQuery] = React.useState("")
  const [panelOpen, setPanelOpen] = React.useState(false)
  const searchRef = React.useRef<HTMLFormElement>(null)

  // #region agent log
  React.useEffect(() => {
    const payload = {
      hypothesisId: "C",
      location: "store-navbar.tsx:panelOpen",
      message: "panelOpen changed",
      runId: "post-fix",
      data: { panelOpen, queryLen: query.trim().length },
    }
    fetch("/api/health/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {})
    fetch(
      "http://127.0.0.1:7898/ingest/841f1275-974c-4ae8-9d0d-4af60275142b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "23a3c1",
        },
        body: JSON.stringify({
          sessionId: "23a3c1",
          ...payload,
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {})
  }, [panelOpen, query])
  // #endregion

  const closePanel = React.useCallback(() => {
    setPanelOpen(false)
    const input = searchRef.current?.querySelector("input")
    input?.blur()
  }, [])

  React.useEffect(() => {
    if (!panelOpen) return

    function onPointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (searchRef.current?.contains(target)) return
      if (document.getElementById("store-search-panel-portal")?.contains(target))
        return
      closePanel()
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel()
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [panelOpen, closePanel])

  async function onSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    const q = query.trim()
    closePanel()
    if (q) {
      try {
        await recordSearchHistory(token, { query: q })
      } catch {
        // continue
      }
      router.push(`/search?q=${encodeURIComponent(q)}`)
    } else {
      router.push("/search")
    }
  }

  return (
    <div className="h-[var(--store-nav-height)] w-full">
      <div className="mx-auto flex h-full w-full min-w-0 max-w-[var(--store-container-max)] items-center gap-2 px-3 sm:px-4 md:gap-4">
        <Link
          href="/"
          className="relative size-11 shrink-0 md:size-14"
          aria-label="Kalibri Texnika"
        >
          <Image
            src={STORE_LOGO_SRC}
            alt="Kalibri Texnika"
            fill
            priority
            className="object-contain"
            sizes="(max-width: 768px) 44px, 56px"
          />
        </Link>

        <form
          ref={searchRef}
          onSubmit={onSearchSubmit}
          className="relative z-50 min-w-0 flex-1"
        >
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground md:left-3.5 md:size-5" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPanelOpen(true)
            }}
            onFocus={() => setPanelOpen(true)}
            placeholder="Mahsulot qidiring"
            className="h-10 w-full rounded-2xl bg-muted/60 pl-9 text-sm focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:h-11 md:pl-11 md:text-base"
            type="search"
            name="q"
            autoComplete="off"
            aria-expanded={panelOpen}
            aria-controls="store-search-panel"
          />
          <div id="store-search-panel">
            <SearchPanel
              open={panelOpen}
              query={query}
              onQueryChange={setQuery}
              onClose={closePanel}
              anchorRef={searchRef}
            />
          </div>
        </form>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden size-11 shrink-0 md:inline-flex"
          aria-label="Kataloglar"
          onClick={() => setOpen(true)}
        >
          <IconLayoutGrid className="size-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 shrink-0 md:hidden"
          render={<Link href="/cart" />}
          aria-label="Savatcha"
        >
          <IconShoppingCart className="size-5" />
          {cartCount > 0 ? (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          ) : null}
        </Button>

        <div className="hidden items-center gap-1.5 md:flex">
          <Button
            variant="ghost"
            className="h-11 gap-2 px-3 font-normal"
            render={<a href={`tel:${STORE_PHONE_TEL}`} />}
          >
            <IconPhone className="size-5 shrink-0" />
            <span className="text-sm tabular-nums">{STORE_PHONE}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative size-11"
            render={<Link href="/cart" />}
            aria-label="Savatcha"
          >
            <IconShoppingCart className="size-5" />
            {cartCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            render={<Link href="/favorites" />}
            aria-label="Yoqtirganlari"
          >
            <IconHeart className="size-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            render={<Link href="/profile" />}
            aria-label="Profile"
          >
            <IconUser className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { glassNav as storeHeaderGlass }
