"use client"

import * as React from "react"

import { ProductCard } from "@/components/store/product-card"
import { ProductGridSkeleton } from "@/components/store/store-skeletons"
import { useFavoritesStore } from "@/hooks/use-favorites"
import { listProducts, type StoreProduct } from "@/lib/api/products"

function orderByIds(products: StoreProduct[], ids: string[]) {
  const byId = new Map(products.map((product) => [product.id, product]))
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is StoreProduct => product != null)
}

export function FavoritesPageClient() {
  const ids = useFavoritesStore((s) => s.ids)
  const ready = useFavoritesStore((s) => s.ready)
  const [persistHydrated, setPersistHydrated] = React.useState(false)
  const [products, setProducts] = React.useState<StoreProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const productsRef = React.useRef(products)
  productsRef.current = products

  React.useEffect(() => {
    const finish = () => setPersistHydrated(true)
    if (useFavoritesStore.persist.hasHydrated()) {
      finish()
      return
    }
    return useFavoritesStore.persist.onFinishHydration(finish)
  }, [])

  const hydrated = persistHydrated && ready

  React.useEffect(() => {
    if (!hydrated) return

    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    const cached = productsRef.current
    const missing = ids.filter((id) => !cached.some((p) => p.id === id))
    if (missing.length === 0) {
      setProducts(orderByIds(cached, ids))
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    listProducts({ ids })
      .then(({ items }) => {
        if (!cancelled) setProducts(orderByIds(items, ids))
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [hydrated, ids])

  const visible = orderByIds(products, ids)

  if (!hydrated || loading) {
    return (
      <div className="flex min-w-0 flex-col gap-4 py-3 md:gap-5 md:py-4">
        <ProductGridSkeleton count={6} />
      </div>
    )
  }

  if (ids.length === 0 || visible.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-4 py-3 md:gap-5 md:py-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
