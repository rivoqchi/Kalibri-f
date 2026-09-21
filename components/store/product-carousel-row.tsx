"use client"

import * as React from "react"

import { ProductCard } from "@/components/store/product-card"
import type { StoreProduct } from "@/lib/api/products"
import { cn } from "@/lib/utils"

type ProductCarouselRowProps = {
  title?: string
  products: StoreProduct[]
  className?: string
}

export function ProductCarouselRow({
  title,
  products,
  className,
}: ProductCarouselRowProps) {
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
    <section className={cn("min-w-0", className)}>
      {title ? (
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground md:mb-4 md:text-xl">
          {title}
        </h2>
      ) : null}

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
