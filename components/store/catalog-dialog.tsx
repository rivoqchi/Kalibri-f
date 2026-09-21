"use client"

import * as React from "react"

import { CatalogCategoryList } from "@/components/store/catalog-category-list"
import { useCatalog } from "@/components/store/catalog-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { listCategories, type StoreCategory } from "@/lib/api/categories"

export function CatalogDialog() {
  const { open, setOpen } = useCatalog()
  const isMobile = useIsMobile()
  const [categories, setCategories] = React.useState<StoreCategory[]>([])
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    if (isMobile && open) setOpen(false)
  }, [isMobile, open, setOpen])

  React.useEffect(() => {
    if (!open || loaded || isMobile) return

    let cancelled = false

    listCategories()
      .then((data) => {
        if (!cancelled) {
          setCategories(Array.isArray(data) ? data : [])
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([])
          setLoaded(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, loaded, isMobile])

  if (isMobile) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="flex h-[min(92dvh,52rem)] w-[min(96vw,72rem)] max-w-none flex-col gap-4 overflow-hidden bg-background p-5 sm:max-w-none sm:p-8"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Kataloglar</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loaded && categories.length === 0 ? null : (
            <CatalogCategoryList
              categories={categories}
              onSelect={() => setOpen(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
