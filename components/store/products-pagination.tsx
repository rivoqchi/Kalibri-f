"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

type ProductsPaginationProps = {
  page: number
  total: number
  limit: number
  className?: string
}

function buildPageItems(current: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: Array<number | "ellipsis"> = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(totalPages - 1, current + 1)

  if (start > 2) items.push("ellipsis")
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < totalPages - 1) items.push("ellipsis")
  items.push(totalPages)
  return items
}

export function ProductsPagination({
  page,
  total,
  limit,
  className,
}: ProductsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)))
  const current = Math.min(Math.max(1, page), totalPages)

  if (totalPages <= 1) return null

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams(searchParams.toString())
    if (nextPage <= 1) next.delete("page")
    else next.set("page", String(nextPage))
    const qs = next.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const items = buildPageItems(current, totalPages)

  return (
    <Pagination className={cn("pt-2 pb-1", className)}>
      <PaginationContent>
        <PaginationItem>
          {current <= 1 ? (
            <Button
              variant="ghost"
              size="default"
              className="min-h-11 gap-1 rounded-2xl px-3 sm:min-h-9"
              disabled
            >
              Oldingi
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="default"
              className="min-h-11 gap-1 rounded-2xl px-3 sm:min-h-9"
              nativeButton={false}
              render={
                <Link href={hrefFor(current - 1)} scroll aria-label="Oldingi" />
              }
            >
              Oldingi
            </Button>
          )}
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`e-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <Button
                variant={item === current ? "outline" : "ghost"}
                size="icon"
                className="min-h-11 min-w-11 rounded-2xl sm:min-h-9 sm:min-w-9"
                nativeButton={false}
                render={
                  <Link
                    href={hrefFor(item)}
                    scroll
                    aria-label={`${item}`}
                    aria-current={item === current ? "page" : undefined}
                  />
                }
              >
                {item}
              </Button>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {current >= totalPages ? (
            <Button
              variant="ghost"
              size="default"
              className="min-h-11 gap-1 rounded-2xl px-3 sm:min-h-9"
              disabled
            >
              Keyingi
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="default"
              className="min-h-11 gap-1 rounded-2xl px-3 sm:min-h-9"
              nativeButton={false}
              render={
                <Link href={hrefFor(current + 1)} scroll aria-label="Keyingi" />
              }
            >
              Keyingi
            </Button>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
