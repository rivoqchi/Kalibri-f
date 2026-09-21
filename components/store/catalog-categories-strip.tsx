"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { StoreCategory } from "@/lib/api/categories"
import { cn } from "@/lib/utils"

const DRAG_THRESHOLD = 6

type CatalogCategoriesStripProps = {
  categories: StoreCategory[]
}

export function CatalogCategoriesStrip({
  categories,
}: CatalogCategoriesStripProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<{
    pointerId: number
    startX: number
    scrollLeft: number
    moved: boolean
  } | null>(null)
  const suppressClickRef = React.useRef(false)
  const [canScroll, setCanScroll] = React.useState({ left: false, right: false })

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setCanScroll({
      left: el.scrollLeft > 2,
      right: max > 2 && el.scrollLeft < max - 2,
    })
  }, [])

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    updateScrollState()

    const onScroll = () => updateScrollState()
    el.addEventListener("scroll", onScroll, { passive: true })

    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [categories, updateScrollState])

  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    function onWheel(event: WheelEvent) {
      if (!el) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      if (el.scrollWidth <= el.clientWidth) return
      event.preventDefault()
      el.scrollLeft += event.deltaY
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [categories])

  function scrollByDir(dir: -1 | 1) {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({
      left: dir * Math.min(280, el.clientWidth * 0.7),
      behavior: "smooth",
    })
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) return
    const el = scrollerRef.current
    if (!el || el.scrollWidth <= el.clientWidth) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    }
    el.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || !el || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD) return
    drag.moved = true
    el.scrollLeft = drag.scrollLeft - dx
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    const el = scrollerRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (drag.moved) suppressClickRef.current = true
    dragRef.current = null
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  if (categories.length === 0) return null

  const showChevrons = canScroll.left || canScroll.right

  return (
    <div className="hidden h-[var(--store-categories-height)] w-full md:block">
      <div className="relative mx-auto flex h-full w-full min-w-0 max-w-[var(--store-container-max)] items-center px-3 sm:px-4">
        {showChevrons ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute left-0 z-10 hidden size-8 rounded-lg bg-muted/80 shadow-sm md:inline-flex",
              !canScroll.left && "pointer-events-none opacity-0",
            )}
            aria-label="Chapga"
            onClick={() => scrollByDir(-1)}
            tabIndex={canScroll.left ? 0 : -1}
          >
            <IconChevronLeft className="size-4" />
          </Button>
        ) : null}

        <div
          ref={scrollerRef}
          className={cn(
            "flex h-full w-full touch-pan-x items-center gap-5 overflow-x-auto overscroll-x-contain sm:gap-6",
            "cursor-grab select-none active:cursor-grabbing",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            showChevrons && "px-9",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              className={cn(
                "group flex shrink-0 items-center gap-2.5 rounded-xl py-1.5 pr-1",
                "transition-opacity hover:opacity-80 active:opacity-70",
              )}
              draggable={false}
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-transparent sm:size-11">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    fill
                    className="object-contain p-0.5 mix-blend-multiply"
                    sizes="44px"
                    draggable={false}
                  />
                ) : null}
              </span>
              <span className="max-w-[9.5rem] truncate whitespace-nowrap text-sm font-medium text-foreground sm:max-w-[12rem]">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

        {showChevrons ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute right-0 z-10 hidden size-8 rounded-lg bg-muted/80 shadow-sm md:inline-flex",
              !canScroll.right && "pointer-events-none opacity-0",
            )}
            aria-label="O‘ngga"
            onClick={() => scrollByDir(1)}
            tabIndex={canScroll.right ? 0 : -1}
          >
            <IconChevronRight className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}
