"use client"

import * as React from "react"
import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"

import { ProductCard } from "@/components/store/product-card"
import type { StoreProduct } from "@/lib/api/products"
import { cn } from "@/lib/utils"

export function HomeProductsSection({
  products,
  title = "Maxsulotlarimiz",
  seeAllHref = "/products",
}: {
  products: StoreProduct[]
  title?: string
  seeAllHref?: string
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    function onWheel(event: WheelEvent) {
      if (!el) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (el.scrollWidth <= el.clientWidth) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [products])

  if (products.length === 0) return null

  return (
    <section className="min-w-0 pb-2 md:pb-4">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
          {title}
        </h2>
        <Link
          href={seeAllHref}
          className="inline-flex min-h-9 shrink-0 items-center gap-0.5 rounded-2xl px-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Barchasi
          <IconChevronRight className="size-4" />
        </Link>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "-mx-1 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain px-1 pb-1",
          "scroll-smooth sm:gap-4",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[42vw] max-w-[11.5rem] shrink-0 sm:w-44 sm:max-w-none md:w-48"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
