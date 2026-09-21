"use client"

import type { MouseEvent, PointerEvent } from "react"
import {
  IconMinus,
  IconPlus,
  IconShoppingCart,
  IconTrash,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/use-cart"
import type { Money } from "@/types/commerce"
import { cn } from "@/lib/utils"

function playTing() {
  try {
    const audio = new Audio("/sounds/ting.wav")
    void audio.play().catch(() => {})
  } catch {
    // ignore autoplay / missing asset failures
  }
}

function stopNav(e: MouseEvent | PointerEvent) {
  e.preventDefault()
  e.stopPropagation()
}

export type ProductCartControlsProps = {
  productId: string
  slug: string
  name: string
  unitPrice: Money
  imageUrl?: string
  inStock: boolean
  variant?: "card" | "detail"
  /** Denser card for overlays (search panel). Only applies to `card`. */
  compact?: boolean
  className?: string
}

export function ProductCartControls({
  productId,
  slug,
  name,
  unitPrice,
  imageUrl,
  inStock,
  variant = "card",
  compact = false,
  className,
}: ProductCartControlsProps) {
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.productId === productId)?.quantity ?? 0,
  )
  const addItem = useCartStore((s) => s.addItem)
  const setQuantity = useCartStore((s) => s.setQuantity)

  const isCard = variant === "card"
  const isDetail = variant === "detail"

  const guard = (e: MouseEvent) => {
    if (isCard) stopNav(e)
  }

  const handleAdd = (e: MouseEvent) => {
    guard(e)
    if (!inStock) return
    playTing()
    addItem({
      productId,
      slug,
      name,
      quantity: 1,
      unitPrice,
      imageUrl,
    })
  }

  const handlePlus = (e: MouseEvent) => {
    guard(e)
    setQuantity(productId, quantity + 1)
  }

  const handleMinus = (e: MouseEvent) => {
    guard(e)
    setQuantity(productId, quantity - 1)
  }

  const iconClass = compact ? "size-3.5" : isDetail ? "size-5" : "size-4"
  const qtyBtnClass = compact ? "size-7" : isDetail ? "size-10" : "size-8"

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        compact ? "min-h-8" : isDetail ? "min-h-11" : "min-h-9",
        className,
      )}
    >
      {quantity > 0 ? (
        <div
          className={cn(
            "flex w-full items-center justify-between gap-1 px-0.5 animate-in fade-in zoom-in-95 duration-200",
            isDetail && "max-w-sm",
          )}
          onClick={isCard ? stopNav : undefined}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={quantity <= 1 ? "O'chirish" : "Minus"}
            className={cn(
              "shrink-0 border-0 bg-transparent shadow-none transition-transform duration-150 hover:bg-transparent active:scale-90",
              qtyBtnClass,
            )}
            onClick={handleMinus}
          >
            {quantity <= 1 ? (
              <IconTrash className={iconClass} />
            ) : (
              <IconMinus className={iconClass} />
            )}
          </Button>
          <span
            className={cn(
              "min-w-6 text-center font-semibold tabular-nums text-foreground",
              compact ? "text-xs" : isDetail ? "text-base" : "text-sm",
            )}
            aria-live="polite"
          >
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Plus"
            className={cn(
              "shrink-0 border-0 bg-transparent shadow-none transition-transform duration-150 hover:bg-transparent active:scale-90",
              qtyBtnClass,
            )}
            onClick={handlePlus}
          >
            <IconPlus className={iconClass} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="default"
          size={isDetail ? "lg" : undefined}
          disabled={!inStock}
          className={cn(
            "w-full justify-center gap-1.5 border-0 bg-primary font-medium text-white shadow-none transition-transform duration-150 hover:bg-primary/90 hover:text-white active:scale-[0.97] dark:bg-primary dark:text-white dark:hover:bg-primary/90 dark:hover:text-white",
            compact
              ? "h-8 rounded-xl text-xs"
              : isDetail
                ? "h-11 max-w-sm gap-2 rounded-2xl text-sm sm:w-auto"
                : "h-9 rounded-2xl text-sm sm:h-10",
          )}
          onClick={handleAdd}
        >
          <IconShoppingCart className={iconClass} />
          Savatga
        </Button>
      )}
    </div>
  )
}
