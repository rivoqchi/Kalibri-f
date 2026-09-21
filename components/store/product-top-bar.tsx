"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft, IconShoppingCart } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/use-cart"
import {
  canSoftStoreBack,
  getStoreReturnPath,
  markScrollRestorePending,
} from "@/lib/store-scroll"
import { cn } from "@/lib/utils"

const glassNav =
  "bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"

export function ProductTopBar() {
  const router = useRouter()
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  )

  function onBack() {
    markScrollRestorePending()
    // Soft client back only when we entered PDP from an in-app listing.
    // Avoid history.length alone (often >1) sending users off-site.
    if (canSoftStoreBack() && window.history.length > 1) {
      router.back()
      return
    }
    router.push(getStoreReturnPath())
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[var(--store-nav-height)]",
        glassNav,
      )}
    >
      <div className="mx-auto flex h-full w-full min-w-0 max-w-[var(--store-container-max)] items-center justify-between gap-2 px-3 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 md:size-11"
          aria-label="Orqaga"
          onClick={onBack}
        >
          <IconArrowLeft className="size-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 shrink-0 md:size-11"
          render={<Link href="/cart" />}
          aria-label="Savatcha"
        >
          <IconShoppingCart className="size-5" />
          {cartCount > 0 ? (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground md:top-1.5 md:right-1.5">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          ) : null}
        </Button>
      </div>
    </header>
  )
}
