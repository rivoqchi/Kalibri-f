"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { IconClock, IconSearch, IconX } from "@tabler/icons-react"

import { ProductCard } from "@/components/store/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/use-debounce"
import { useAuthStore } from "@/lib/auth/store"
import { ApiError } from "@/lib/api/client"
import {
  deleteSearchHistory,
  listSearchHistory,
  listSearchRecentProducts,
  recordSearchHistory,
  recordSearchRecentProduct,
  searchProducts,
  searchSuggest,
  type SearchHistoryItem,
} from "@/lib/api/search"
import type { StoreProduct } from "@/lib/api/products"
import { cn } from "@/lib/utils"

const HISTORY_PREVIEW_LIMIT = 5

type SearchPanelProps = {
  open: boolean
  query: string
  onQueryChange: (value: string) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
  className?: string
}

export function SearchPanel({
  open,
  query,
  onQueryChange,
  onClose,
  anchorRef,
  className,
}: SearchPanelProps) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const debouncedQuery = useDebouncedValue(query, 280)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const [coords, setCoords] = React.useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const [mounted, setMounted] = React.useState(false)

  const [history, setHistory] = React.useState<SearchHistoryItem[]>([])
  const [historyHasMore, setHistoryHasMore] = React.useState(false)
  const [historyExpanded, setHistoryExpanded] = React.useState(false)
  const [historyLoading, setHistoryLoading] = React.useState(false)
  const [historyExpandLoading, setHistoryExpandLoading] = React.useState(false)
  const [idleFetched, setIdleFetched] = React.useState(false)

  const [recent, setRecent] = React.useState<StoreProduct[]>([])
  const [recentLoading, setRecentLoading] = React.useState(false)

  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [correctedHint, setCorrectedHint] = React.useState<string | null>(null)
  const [previewProducts, setPreviewProducts] = React.useState<StoreProduct[]>(
    [],
  )
  const [previewLoading, setPreviewLoading] = React.useState(false)

  const requestIdRef = React.useRef(0)
  const queryTrimmed = query.trim()
  const hasTypedQuery = queryTrimmed.length > 0
  const searchQuery = debouncedQuery.trim()
  const searchReady = searchQuery.length > 0
  const waitingDebounce = hasTypedQuery && !searchReady

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }

    function updateCoords() {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    updateCoords()
    window.addEventListener("resize", updateCoords)
    window.addEventListener("scroll", updateCoords, true)
    return () => {
      window.removeEventListener("resize", updateCoords)
      window.removeEventListener("scroll", updateCoords, true)
    }
  }, [open, anchorRef])

  const loadIdleData = React.useCallback(async () => {
    setHistoryLoading(true)
    setRecentLoading(true)
    setIdleFetched(false)
    setHistoryExpanded(false)

    const [historySettled, recentSettled] = await Promise.allSettled([
      listSearchHistory(token, { limit: HISTORY_PREVIEW_LIMIT, offset: 0 }),
      listSearchRecentProducts(token, { limit: 10 }),
    ])

    // #region agent log
    const idleLog = {
      hypothesisId: "A",
      location: "search-panel.tsx:loadIdleData",
      message: "idle fetch settled",
      runId: "post-fix",
      data: {
        historyOk: historySettled.status === "fulfilled",
        historyCount:
          historySettled.status === "fulfilled"
            ? historySettled.value.items.length
            : -1,
        historyErr:
          historySettled.status === "rejected"
            ? String(
                (historySettled.reason as Error)?.message ||
                  historySettled.reason,
              )
            : null,
        recentOk: recentSettled.status === "fulfilled",
        recentCount:
          recentSettled.status === "fulfilled"
            ? recentSettled.value.items.length
            : -1,
        recentErr:
          recentSettled.status === "rejected"
            ? String(
                (recentSettled.reason as Error)?.message ||
                  recentSettled.reason,
              )
            : null,
        hasToken: Boolean(token),
      },
    }
    fetch("/api/health/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(idleLog),
    }).catch(() => {})
    // #endregion

    if (historySettled.status === "fulfilled") {
      setHistory(historySettled.value.items)
      setHistoryHasMore(historySettled.value.hasMore)
    } else {
      setHistory([])
      setHistoryHasMore(false)
    }
    setHistoryLoading(false)

    if (recentSettled.status === "fulfilled") {
      setRecent(recentSettled.value.items)
    } else {
      setRecent([])
    }
    setRecentLoading(false)
    setIdleFetched(true)
  }, [token])

  React.useEffect(() => {
    if (!open) {
      setIdleFetched(false)
      setHistoryExpanded(false)
      return
    }
    if (!hasTypedQuery) {
      void loadIdleData()
    }
  }, [open, hasTypedQuery, loadIdleData])

  React.useEffect(() => {
    if (!open || !searchReady) {
      if (!hasTypedQuery) {
        setSuggestions([])
        setCorrectedHint(null)
        setPreviewProducts([])
        setPreviewLoading(false)
      }
      return
    }

    const requestId = ++requestIdRef.current
    setPreviewLoading(true)

    void (async () => {
      try {
        const [suggestRes, productsRes] = await Promise.all([
          searchSuggest({ q: searchQuery, limit: 6 }),
          searchProducts({ q: searchQuery, limit: 8, page: 1 }),
        ])
        if (requestId !== requestIdRef.current) return
        setSuggestions(suggestRes.suggestions)
        setCorrectedHint(
          productsRes.wasCorrected ? productsRes.correctedQuery : null,
        )
        setPreviewProducts(productsRes.items)
      } catch {
        if (requestId !== requestIdRef.current) return
        setSuggestions([])
        setCorrectedHint(null)
        setPreviewProducts([])
      } finally {
        if (requestId === requestIdRef.current) {
          setPreviewLoading(false)
        }
      }
    })()
  }, [open, hasTypedQuery, searchReady, searchQuery])

  async function expandAllHistory() {
    if (historyExpanded) {
      setHistoryExpanded(false)
      return
    }

    setHistoryExpanded(true)
    if (!historyHasMore) return

    setHistoryExpandLoading(true)
    try {
      const res = await listSearchHistory(token, {
        limit: 50,
        offset: 0,
      })
      setHistory(res.items)
      setHistoryHasMore(res.hasMore)
    } catch {
      // keep current list
    } finally {
      setHistoryExpandLoading(false)
    }
  }

  async function removeHistoryItem(item: SearchHistoryItem) {
    const prev = history
    const prevHasMore = historyHasMore
    setHistory((list) => list.filter((h) => h.query !== item.query))
    try {
      await deleteSearchHistory(token, item.query)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return
      setHistory(prev)
      setHistoryHasMore(prevHasMore)
    }
  }

  async function commitSearch(raw: string, corrected?: string | null) {
    const q = raw.trim()
    if (!q) return
    onClose()
    try {
      await recordSearchHistory(token, {
        query: q,
        correctedQuery: corrected,
      })
    } catch {
      // navigation still proceeds
    }
    const target = corrected?.trim() || q
    router.push(`/search?q=${encodeURIComponent(target)}`)
  }

  async function onProductNavigate(product: StoreProduct) {
    try {
      await recordSearchRecentProduct(token, product.id)
      if (query.trim()) {
        await recordSearchHistory(token, {
          query: query.trim(),
          correctedQuery: correctedHint,
        })
      }
    } catch {
      // ignore
    }
    onClose()
  }

  const showIdleHistory =
    !idleFetched || historyLoading || history.length > 0
  const showIdleRecent = !idleFetched || recentLoading || recent.length > 0
  const idleEmpty =
    idleFetched &&
    !historyLoading &&
    !recentLoading &&
    history.length === 0 &&
    recent.length === 0

  // #region agent log
  React.useEffect(() => {
    if (!open) return
    const panelRect = panelRef.current?.getBoundingClientRect()
    const gateLog = {
      hypothesisId: "G",
      location: "search-panel.tsx:portalLayout",
      message: "panel portal layout",
      runId: "post-fix",
      data: {
        open,
        hasTypedQuery,
        idleEmpty,
        idleFetched,
        historyLen: history.length,
        recentLen: recent.length,
        coords,
        panelTop: panelRect?.top ?? null,
        panelHeight: panelRect?.height ?? null,
        panelWidth: panelRect?.width ?? null,
        willHide: false,
      },
    }
    fetch("/api/health/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gateLog),
    }).catch(() => {})
  }, [
    open,
    hasTypedQuery,
    idleEmpty,
    idleFetched,
    history.length,
    recent.length,
    coords,
  ])
  // #endregion

  if (!open || !mounted || !coords) return null

  const showTypingLoading = waitingDebounce || previewLoading
  const showEmptyState =
    hasTypedQuery &&
    !showTypingLoading &&
    suggestions.length === 0 &&
    previewProducts.length === 0

  const visibleHistory = historyExpanded
    ? history
    : history.slice(0, HISTORY_PREVIEW_LIMIT)
  const canShowAllHistoryControl =
    historyHasMore || history.length > HISTORY_PREVIEW_LIMIT || historyExpanded

  const panel = (
    <div
      ref={panelRef}
      id="store-search-panel-portal"
      className={cn(
        "fixed z-[60] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-md",
        className,
      )}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
      }}
      role="listbox"
    >
      <div className="flex max-h-[min(72vh,36rem)] flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!hasTypedQuery ? (
          <>
            {showIdleHistory ? (
              <div
                className={cn(
                  "shrink-0 px-2.5 pt-2 pb-1.5 sm:px-3",
                  showIdleRecent && "border-b border-border/50",
                )}
              >
                {historyLoading || !idleFetched ? (
                  <div className="flex flex-col gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    <ul
                      className={cn(
                        "flex flex-col",
                        historyExpanded &&
                          "max-h-[min(40vh,16rem)] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                      )}
                    >
                      {visibleHistory.map((item) => (
                        <li
                          key={`${item.query}-${item.searchedAt}`}
                          className="flex min-h-10 items-center gap-0.5"
                        >
                          <button
                            type="button"
                            className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 text-left text-sm transition-colors hover:bg-muted/70 active:bg-muted"
                            onClick={() =>
                              void commitSearch(
                                item.query,
                                item.correctedQuery,
                              )
                            }
                          >
                            <IconClock className="size-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 truncate">
                              {item.query}
                            </span>
                          </button>
                          <button
                            type="button"
                            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground active:bg-muted"
                            aria-label="O'chirish"
                            onClick={(e) => {
                              e.stopPropagation()
                              void removeHistoryItem(item)
                            }}
                          >
                            <IconX className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {canShowAllHistoryControl ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="mt-0.5 h-9 w-full justify-center rounded-xl text-sm"
                        disabled={historyExpandLoading}
                        onClick={() => void expandAllHistory()}
                      >
                        Barcha qidiruvlar
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {showIdleRecent ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 sm:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {recentLoading || !idleFetched ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="aspect-[3/4] w-full rounded-xl"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-2.5">
                    {recent.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => void onProductNavigate(product)}
                      >
                        <ProductCard product={product} compact />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {idleEmpty ? (
              <div className="flex flex-col items-center justify-center gap-1 px-3 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  topilmadi
                </p>
                <p className="text-sm text-muted-foreground">
                  bunda tavar mavjud emas
                </p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {correctedHint ? (
              <p className="mb-2 px-1 text-xs text-muted-foreground">
                {correctedHint}
              </p>
            ) : null}

            {suggestions.length > 0 ? (
              <ul className="mb-2.5 flex flex-col">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className="flex w-full min-h-10 items-center gap-2.5 rounded-xl px-2 text-left text-sm transition-colors hover:bg-muted/70 active:bg-muted"
                      onClick={() => {
                        onQueryChange(suggestion)
                        void commitSearch(suggestion)
                      }}
                    >
                      <IconSearch className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 truncate">{suggestion}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {showTypingLoading ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[3/4] w-full rounded-xl"
                  />
                ))}
              </div>
            ) : previewProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-2.5">
                {previewProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => void onProductNavigate(product)}
                  >
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            ) : showEmptyState ? (
              <div className="flex flex-col items-center justify-center gap-1 px-3 py-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  topilmadi
                </p>
                <p className="text-sm text-muted-foreground">
                  bunda tavar mavjud emas
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
