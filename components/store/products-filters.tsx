"use client"

import { useEffect, useState, useTransition } from "react"
import { IconChevronDown, IconFilter } from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import type { StoreBrand } from "@/lib/api/brands"
import type { StoreCategory } from "@/lib/api/categories"
import { formatSom, formatSomInput, parseSomInput } from "@/lib/api/products"
import { cn } from "@/lib/utils"

const BRANDS_PREVIEW = 6

export type ProductsFilterValues = {
  sort?: string
  brand?: string
  category?: string
  minPrice?: number
  maxPrice?: number
}

type ProductsFiltersProps = {
  brands: StoreBrand[]
  categories: StoreCategory[]
  priceBounds: { min: number; max: number }
  values: ProductsFilterValues
  className?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function ProductsFiltersPanel({
  brands,
  categories,
  priceBounds,
  values,
  onNavigate,
}: ProductsFiltersProps & {
  onNavigate: (patch: Record<string, string | null>) => void
}) {
  const boundMin = priceBounds.min
  const boundMax = Math.max(priceBounds.max, boundMin)
  const selectedMin = values.minPrice ?? boundMin
  const selectedMax = values.maxPrice ?? boundMax

  const [range, setRange] = useState<[number, number]>([
    clamp(selectedMin, boundMin, boundMax),
    clamp(selectedMax, boundMin, boundMax),
  ])
  const [minText, setMinText] = useState(formatSom(range[0]))
  const [maxText, setMaxText] = useState(formatSom(range[1]))
  const [brandsExpanded, setBrandsExpanded] = useState(false)

  useEffect(() => {
    const nextMin = clamp(values.minPrice ?? boundMin, boundMin, boundMax)
    const nextMax = clamp(values.maxPrice ?? boundMax, boundMin, boundMax)
    const ordered: [number, number] =
      nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin]
    setRange(ordered)
    setMinText(formatSom(ordered[0]))
    setMaxText(formatSom(ordered[1]))
  }, [values.minPrice, values.maxPrice, boundMin, boundMax])

  const visibleBrands = brandsExpanded
    ? brands
    : brands.slice(0, BRANDS_PREVIEW)
  const canExpandBrands = brands.length > BRANDS_PREVIEW

  function commitPrice(next: [number, number]) {
    const lo = clamp(Math.min(next[0], next[1]), boundMin, boundMax)
    const hi = clamp(Math.max(next[0], next[1]), boundMin, boundMax)
    setRange([lo, hi])
    setMinText(formatSom(lo))
    setMaxText(formatSom(hi))
    onNavigate({
      minPrice: lo <= boundMin ? null : String(lo),
      maxPrice: hi >= boundMax ? null : String(hi),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2.5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Narx
        </h2>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 rounded-2xl bg-input/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">Dan</span>
            <Input
              inputMode="numeric"
              value={minText}
              onChange={(e) => setMinText(formatSomInput(e.target.value))}
              onBlur={() => {
                const parsed = parseSomInput(minText)
                if (!Number.isFinite(parsed)) {
                  setMinText(formatSom(range[0]))
                  return
                }
                commitPrice([parsed, range[1]])
              }}
              className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
            />
          </label>
          <label className="flex flex-col gap-1 rounded-2xl bg-input/50 px-3 py-2">
            <span className="text-xs text-muted-foreground">Gacha</span>
            <Input
              inputMode="numeric"
              value={maxText}
              onChange={(e) => setMaxText(formatSomInput(e.target.value))}
              onBlur={() => {
                const parsed = parseSomInput(maxText)
                if (!Number.isFinite(parsed)) {
                  setMaxText(formatSom(range[1]))
                  return
                }
                commitPrice([range[0], parsed])
              }}
              className="h-8 border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-visible:ring-0"
            />
          </label>
        </div>
        <Slider
          min={boundMin}
          max={boundMax}
          step={Math.max(1, Math.round((boundMax - boundMin) / 200))}
          value={range}
          onValueChange={(next) => {
            if (!Array.isArray(next) || next.length < 2) return
            const lo = Number(next[0])
            const hi = Number(next[1])
            if (!Number.isFinite(lo) || !Number.isFinite(hi)) return
            setRange([lo, hi])
            setMinText(formatSom(lo))
            setMaxText(formatSom(hi))
          }}
          onValueCommitted={(next) => {
            if (!Array.isArray(next) || next.length < 2) return
            commitPrice([Number(next[0]), Number(next[1])])
          }}
          className="mt-1 px-1"
        />
      </section>

      {brands.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Brend
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {visibleBrands.map((brand) => {
              const active = values.brand === brand.name
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() =>
                    onNavigate({ brand: active ? null : brand.name })
                  }
                  className={cn(
                    "min-h-10 truncate rounded-2xl bg-input/50 px-2.5 text-sm font-medium text-foreground transition-colors",
                    active && "bg-primary text-primary-foreground",
                  )}
                >
                  {brand.name}
                </button>
              )
            })}
          </div>
          {canExpandBrands ? (
            <button
              type="button"
              onClick={() => setBrandsExpanded((v) => !v)}
              className="inline-flex min-h-9 items-center gap-1 self-start text-sm font-medium text-foreground"
            >
              Ko&apos;proq ko&apos;rsatish
              <IconChevronDown
                className={cn(
                  "size-4 transition-transform",
                  brandsExpanded && "rotate-180",
                )}
              />
            </button>
          ) : null}
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Kategoriya
          </h2>
          <ul className="flex flex-col gap-1">
            {categories.map((category) => {
              const active = values.category === category.slug
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate({
                        category: active ? null : category.slug,
                      })
                    }
                    className={cn(
                      "flex min-h-10 w-full items-center rounded-2xl px-3 text-left text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-input/50 text-foreground hover:bg-input",
                    )}
                  >
                    {category.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export function ProductsFilters(props: ProductsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)

  function onNavigate(patch: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") next.delete(key)
      else next.set(key, value)
    }
    next.delete("page")
    const qs = next.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <>
      <div className="lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                className="h-11 w-full gap-2 rounded-2xl"
              />
            }
          >
            <IconFilter className="size-4" />
            Filter
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100%,20rem)] gap-0 p-0 sm:max-w-xs"
          >
            <SheetHeader className="border-b border-border/60 p-4">
              <SheetTitle>Filter</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ProductsFiltersPanel {...props} onNavigate={onNavigate} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside
        className={cn(
          "hidden w-[280px] shrink-0 lg:block",
          props.className,
        )}
      >
        <div className="sticky top-[calc(var(--store-nav-height)+var(--store-categories-height)+0.75rem)] rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm">
          <div className="max-h-[calc(100dvh-var(--store-nav-height)-var(--store-categories-height)-2rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProductsFiltersPanel {...props} onNavigate={onNavigate} />
          </div>
        </div>
      </aside>
    </>
  )
}
