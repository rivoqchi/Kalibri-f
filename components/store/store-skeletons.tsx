import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ProductCardSkeleton({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        compact ? "gap-1.5" : "gap-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          compact ? "aspect-[3/4] rounded-xl" : "aspect-[4/5] rounded-2xl",
        )}
      >
        <Skeleton className="size-full rounded-[inherit]" />
        {!compact ? (
          <>
            <Skeleton className="absolute top-2.5 left-2.5 z-10 h-5 w-20 rounded-full sm:h-6 sm:w-24" />
            <Skeleton className="absolute top-2.5 right-2.5 z-10 size-9 rounded-full" />
          </>
        ) : (
          <Skeleton className="absolute top-1.5 right-1.5 z-10 size-7 rounded-full" />
        )}
      </div>
      <div className={cn("flex flex-col px-0.5", compact ? "gap-0.5" : "gap-1")}>
        <Skeleton className={cn("h-3 w-14", compact && "h-2.5 w-12")} />
        <Skeleton className={cn("h-4 w-full", compact && "h-3")} />
        <Skeleton className={cn("h-4 w-4/5", compact && "h-3 w-3/4")} />
        <Skeleton
          className={cn("mt-0.5 h-5 w-24", compact ? "h-3.5 w-16" : "sm:h-5")}
        />
        <Skeleton
          className={cn(
            "mt-1 h-9 w-full rounded-2xl",
            compact && "h-8 rounded-xl",
          )}
        />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductCarouselSectionSkeleton({
  cardCount = 4,
  className,
}: {
  cardCount?: number
  className?: string
}) {
  return (
    <section className={cn("min-w-0 pb-2 md:pb-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <Skeleton className="h-6 w-36 md:h-7 md:w-44" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="-mx-1 flex gap-3 overflow-hidden px-1 pb-1 sm:gap-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="w-[42vw] max-w-[11.5rem] shrink-0 sm:w-44 sm:max-w-none md:w-48"
          >
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeBannerSkeleton() {
  return (
    <Skeleton className="aspect-[16/8] w-full rounded-2xl sm:aspect-[21/8] md:aspect-[24/8]" />
  )
}

export function DirectionsStripSkeleton({
  count = 6,
  variant = "section",
  className,
}: {
  count?: number
  variant?: "nav" | "section"
  className?: string
}) {
  const isNav = variant === "nav"
  return (
    <div
      className={cn(
        "flex overflow-hidden",
        isNav
          ? "h-full w-full items-center gap-3 sm:gap-3.5"
          : "-mx-1 gap-3 px-1 pb-0.5 sm:gap-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 flex-col items-center",
            isNav ? "w-[4.25rem] sm:w-[4.5rem]" : "w-[4.5rem] sm:w-[4.75rem]",
          )}
        >
          <Skeleton
            className={cn(
              "rounded-xl",
              isNav ? "size-14 sm:size-[3.75rem]" : "size-16 sm:size-[4.5rem]",
            )}
          />
          <div className="mt-1.5 flex w-full flex-col items-center gap-1">
            <Skeleton className="h-2.5 w-full sm:h-3" />
            <Skeleton className="h-2.5 w-3/4 sm:h-3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CategoriesStripSkeleton() {
  return (
    <div className="hidden h-[var(--store-categories-height)] w-full md:block">
      <div className="mx-auto flex h-full w-full min-w-0 max-w-[var(--store-container-max)] items-center gap-5 overflow-hidden px-3 sm:gap-6 sm:px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2.5">
            <Skeleton className="size-10 rounded-lg sm:size-11" />
            <Skeleton className="h-4 w-24 sm:w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-6 py-3 md:gap-8 md:py-4">
      <HomeBannerSkeleton />
      <DirectionsStripSkeleton />
      <ProductCarouselSectionSkeleton />
      <ProductCarouselSectionSkeleton />
    </div>
  )
}

/** Matches mobile `/products` layout: categories → Filter → sort → grid. */
export function ProductsListingSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-4">
      <div className="md:hidden">
        <DirectionsStripSkeleton count={6} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="lg:hidden">
          <Skeleton className="h-11 w-full rounded-2xl" />
        </div>

        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="rounded-[1.25rem] border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-5 w-24" />
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <Skeleton className="h-4 w-28 sm:h-5 sm:w-32" />
            <Skeleton className="h-11 w-full rounded-2xl sm:w-[min(100%,16.5rem)]" />
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  )
}

export function CatalogPageSkeleton({ withTitle = true }: { withTitle?: boolean }) {
  return (
    <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-6">
      {withTitle ? <Skeleton className="h-6 w-32 md:h-7 md:w-40" /> : null}
      <ul className="grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i} className="flex min-h-11 items-center gap-3 px-2 py-2">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-4 w-28 max-w-full" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CatalogProductsSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-4">
      <Skeleton className="h-6 w-40 md:h-7 md:w-48" />
      <ProductGridSkeleton count={10} />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="flex min-w-0 flex-col">
      <div className="grid min-w-0 grid-cols-1 gap-6 py-3 md:gap-8 md:py-5 lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:gap-y-8 xl:gap-x-8">
        <Skeleton className="aspect-square w-full rounded-2xl lg:col-start-1 lg:row-start-1" />
        <div className="flex min-w-0 flex-col gap-4 md:gap-5 lg:col-start-2 lg:row-start-1">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-4/5 sm:h-8" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 border-t border-border/60 pt-6 pb-2 md:gap-8 md:pt-8 md:pb-4">
        <ProductCarouselSectionSkeleton cardCount={4} />
        <ProductCarouselSectionSkeleton cardCount={4} />
      </div>
    </div>
  )
}
