"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ProductCard } from "@/components/store/product-card"
import { ProductGridSkeleton } from "@/components/store/store-skeletons"
import { useAuthStore } from "@/lib/auth/store"
import {
  recordSearchHistory,
  recordSearchRecentProduct,
  searchProducts,
  type SearchProductsResponse,
} from "@/lib/api/search"

function SearchResults() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q")?.trim() ?? ""
  const token = useAuthStore((s) => s.token)

  const [data, setData] = React.useState<SearchProductsResponse | null>(null)
  const [loading, setLoading] = React.useState(Boolean(q))
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    if (!q) {
      setData(null)
      setLoading(false)
      setError(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(false)

    void (async () => {
      try {
        const res = await searchProducts({ q, limit: 24, page: 1 })
        if (cancelled) return
        setData(res)
        void recordSearchHistory(token, {
          query: q,
          correctedQuery: res.correctedQuery,
        }).catch(() => undefined)
      } catch {
        if (!cancelled) {
          setData(null)
          setError(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [q, token])

  if (!q) return null

  return (
    <div className="flex flex-col gap-4 pb-8 md:gap-5">
      {data?.wasCorrected && data.correctedQuery ? (
        <p className="text-sm text-muted-foreground">{data.correctedQuery}</p>
      ) : null}

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? null : data && data.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
          {data.items.map((product) => (
            <div
              key={product.id}
              onClick={() => {
                void recordSearchRecentProduct(token, product.id).catch(
                  () => undefined,
                )
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<ProductGridSkeleton count={8} />}>
      <SearchResults />
    </React.Suspense>
  )
}
