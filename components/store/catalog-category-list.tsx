"use client"

import Image from "next/image"
import Link from "next/link"

import type { StoreCategory } from "@/lib/api/categories"
import { cn } from "@/lib/utils"

type CatalogCategoryListProps = {
  categories: StoreCategory[]
  onSelect?: () => void
  className?: string
}

export function CatalogCategoryList({
  categories,
  onSelect,
  className,
}: CatalogCategoryListProps) {
  if (categories.length === 0) return null

  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-x-4 gap-y-0.5 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10",
        className,
      )}
    >
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            href={`/products?category=${encodeURIComponent(category.slug)}`}
            onClick={onSelect}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 transition-colors",
              "hover:bg-muted/70 active:bg-muted/70",
            )}
          >
            <div
              className={cn(
                "relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted/30 transition-[background-color,box-shadow]",
                "group-hover:bg-background group-hover:shadow-sm",
                "group-active:bg-background group-active:shadow-sm",
              )}
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : null}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {category.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
