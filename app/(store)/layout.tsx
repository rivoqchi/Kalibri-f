import type { ReactNode } from "react"
import { Suspense } from "react"

import { CatalogCategoriesStrip } from "@/components/store/catalog-categories-strip"
import { CategoriesStripSkeleton } from "@/components/store/store-skeletons"
import { StoreShell } from "@/components/store/store-shell"
import { listCategories } from "@/lib/api/categories"

async function StoreCategoriesStrip() {
  const categories = await listCategories().catch(() => [])
  if (categories.length === 0) return null
  return <CatalogCategoriesStrip categories={categories} />
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <StoreShell
      categoriesSlot={
        <Suspense fallback={<CategoriesStripSkeleton />}>
          <StoreCategoriesStrip />
        </Suspense>
      }
    >
      {children}
    </StoreShell>
  )
}
