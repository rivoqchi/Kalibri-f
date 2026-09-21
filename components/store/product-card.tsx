"use client"

import { IconHeart, IconHeartFilled } from "@tabler/icons-react"
import Link from "next/link"

import { ProductCardMedia } from "@/components/store/product-card-media"
import { ProductCartControls } from "@/components/store/product-cart-controls"
import { Button } from "@/components/ui/button"
import { useFavoritesStore } from "@/hooks/use-favorites"
import {
  formatSom,
  productStatusLabel,
  type StoreProduct,
} from "@/lib/api/products"
import { rememberNavigationToProduct } from "@/lib/store-scroll"
import { cn } from "@/lib/utils"

function galleryImages(product: StoreProduct) {
  const urls = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []
  return [...new Set(urls.filter(Boolean))]
}

function statusChip(product: StoreProduct) {
  const tag =
    product.statusTags.find((t) => t === "new" || t === "seasonal") ??
    product.statusTags[0]
  if (!tag) return null
  return productStatusLabel(tag)
}

export function ProductCard({
  product,
  className,
  compact = false,
}: {
  product: StoreProduct
  className?: string
  /** Denser card for overlays (search panel). */
  compact?: boolean
}) {
  const liked = useFavoritesStore((s) => s.has(product.id))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)

  const images = galleryImages(product)
  const imageSrc = images[0] || ""
  const saleAmount = product.salePrice?.amount
  const hasSale =
    saleAmount != null &&
    Number.isFinite(saleAmount) &&
    saleAmount < product.price.amount
  const unitPrice = hasSale
    ? { amount: saleAmount, currency: product.salePrice!.currency }
    : product.price
  const chip = statusChip(product)

  return (
    <article
      className={cn(
        "group/product flex flex-col transition-transform duration-300 ease-out will-change-transform hover:-translate-y-0.5",
        compact ? "gap-1.5" : "gap-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          compact ? "aspect-[3/4] rounded-xl" : "aspect-[4/5] rounded-2xl",
        )}
      >
        <ProductCardMedia
          href={`/products/${product.slug}`}
          name={product.name}
          images={images}
          compact={compact}
          sizes={
            compact
              ? "(max-width: 768px) 40vw, 160px"
              : "(max-width: 768px) 45vw, (max-width: 1200px) 22vw, 18vw"
          }
        />

        {chip ? (
          <span
            className={cn(
              "pointer-events-none absolute z-10 rounded-full bg-background/90 font-medium tracking-wide text-foreground shadow-sm backdrop-blur-sm",
              compact
                ? "top-1.5 left-1.5 px-1.5 py-0.5 text-[9px]"
                : "top-2.5 left-2.5 px-2 py-0.5 text-[10px] sm:text-xs",
            )}
          >
            {chip}
          </span>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label="Favorite"
          aria-pressed={liked}
          className={cn(
            "absolute z-10 rounded-full border-0 bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-transform duration-200 hover:bg-background active:scale-95",
            compact
              ? "top-1.5 right-1.5 size-7"
              : "top-2.5 right-2.5 size-9",
            liked && "text-destructive",
          )}
          onClick={() => toggleFavorite(product.id)}
        >
          {liked ? (
            <IconHeartFilled className={compact ? "size-3.5" : "size-4"} />
          ) : (
            <IconHeart className={compact ? "size-3.5" : "size-4"} />
          )}
        </Button>
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          compact ? "gap-0.5" : "gap-1",
        )}
      >
        <Link
          href={`/products/${product.slug}`}
          onClick={rememberNavigationToProduct}
          className={cn(
            "flex min-w-0 flex-col px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
            compact ? "gap-0.5" : "gap-1",
          )}
        >
          {product.brand ? (
            <p
              className={cn(
                "truncate font-medium tracking-wide text-muted-foreground uppercase",
                compact ? "text-[10px]" : "text-[11px] sm:text-xs",
              )}
            >
              {product.brand}
            </p>
          ) : null}

          <h3
            className={cn(
              "line-clamp-2 min-h-[2.75em] leading-snug font-medium text-foreground",
              compact ? "text-xs" : "text-sm sm:text-[15px]",
            )}
          >
            {product.name}
          </h3>
        </Link>

        <div
          className={cn(
            "mt-auto flex flex-col",
            compact ? "gap-0.5" : "gap-1",
          )}
        >
          <Link
            href={`/products/${product.slug}`}
            onClick={rememberNavigationToProduct}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
          >
            {hasSale ? (
              <>
                <span
                  className={cn(
                    "font-semibold tracking-tight text-primary",
                    compact ? "text-xs" : "text-sm sm:text-base",
                  )}
                >
                  {formatSom(saleAmount)}
                </span>
                <span
                  className={cn(
                    "text-muted-foreground line-through",
                    compact ? "text-[10px]" : "text-xs sm:text-sm",
                  )}
                >
                  {formatSom(product.price.amount)}
                </span>
              </>
            ) : (
              <span
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  compact ? "text-xs" : "text-sm sm:text-base",
                )}
              >
                {formatSom(product.price.amount)}
              </span>
            )}
          </Link>

          <ProductCartControls
            productId={product.id}
            slug={product.slug}
            name={product.name}
            unitPrice={unitPrice}
            imageUrl={imageSrc || undefined}
            inStock={product.inStock}
            variant="card"
            compact={compact}
          />
        </div>
      </div>
    </article>
  )
}
