"use client"

import { Suspense, type ReactNode } from "react"
import { usePathname } from "next/navigation"

import { CartSync } from "@/components/store/cart-sync"
import { FavoritesSync } from "@/components/store/favorites-sync"
import { CatalogDialog } from "@/components/store/catalog-dialog"
import { CatalogProvider } from "@/components/store/catalog-context"
import { MobileDock } from "@/components/store/mobile-dock"
import { ProductTopBar } from "@/components/store/product-top-bar"
import {
  StoreNavbar,
  storeHeaderGlass,
} from "@/components/store/store-navbar"
import { StoreScrollRestoration } from "@/components/store/store-scroll-restoration"
import { cn } from "@/lib/utils"

export function StoreShell({
  children,
  categoriesSlot,
}: {
  children: ReactNode
  categoriesSlot?: ReactNode
}) {
  const pathname = usePathname()
  const isProductDetail = pathname.startsWith("/products/")
  const showCategoriesChrome = !isProductDetail && categoriesSlot != null

  return (
    <CatalogProvider>
      <CartSync />
      <FavoritesSync />
      <Suspense fallback={null}>
        <StoreScrollRestoration />
      </Suspense>
      {isProductDetail ? (
        <ProductTopBar />
      ) : (
        <header
          className={cn("fixed inset-x-0 top-0 z-40", storeHeaderGlass)}
        >
          {/* Search dropdown must stack above categories strip */}
          <div className="relative z-50">
            <StoreNavbar />
          </div>
          {showCategoriesChrome ? (
            <div className="relative z-30">{categoriesSlot}</div>
          ) : null}
        </header>
      )}
      <main
        className={cn(
          "min-h-dvh min-w-0 overflow-x-clip pb-[calc(var(--store-dock-height)+env(safe-area-inset-bottom))] md:pb-0",
          showCategoriesChrome
            ? "pt-[calc(var(--store-nav-height)+var(--store-categories-height))]"
            : "pt-[var(--store-nav-height)]",
        )}
      >
        <div className="mx-auto w-full min-w-0 max-w-[var(--store-container-max)] px-3 sm:px-4">
          {children}
        </div>
      </main>
      <MobileDock />
      <CatalogDialog />
    </CatalogProvider>
  )
}
