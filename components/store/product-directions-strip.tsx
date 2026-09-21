"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DRAG_THRESHOLD = 6

export type ProductDirectionsStripItem = {
  id: string
  name: string
  imageUrl?: string
  href: string
}

type ProductDirectionsStripProps = {
  items: ProductDirectionsStripItem[]
  title?: string
  /** Override which item is active (matched against `item.href` or `item.id`). */
  activeKey?: string
  /** `nav` = compact under header; `section` = home/products carousel. */
  variant?: "nav" | "section"
  className?: string
  showChevrons?: boolean
}

export function ProductDirectionsStrip({
  items,
  title,
  activeKey,
  variant = "section",
  className,
  showChevrons = variant === "nav",
}: ProductDirectionsStripProps) {
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
  }, [items, updateScrollState])

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
  }, [items])

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

  if (items.length === 0) return null

  const chevronsVisible = showChevrons && (canScroll.left || canScroll.right)
  const isNav = variant === "nav"

  return (
    <section className={cn("min-w-0", className)}>
      {title ? (
        <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground md:mb-4 md:text-xl">
          {title}
        </h2>
      ) : null}

      <div className={cn("relative min-w-0", isNav && "h-full")}>
        {chevronsVisible ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute left-0 top-1/2 z-10 hidden size-8 -translate-y-1/2 rounded-full bg-background/90 shadow-sm md:inline-flex",
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
            "flex touch-pan-x overflow-x-auto overscroll-x-contain",
            "cursor-grab select-none active:cursor-grabbing",
            "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            isNav
              ? "h-full w-full items-center gap-3 sm:gap-3.5"
              : "-mx-1 gap-3 px-1 pb-0.5 sm:gap-4",
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {items.map((item) => {
            const active =
              activeKey != null &&
              (activeKey === item.id || activeKey === item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex shrink-0 flex-col items-center text-center",
                  "transition-opacity hover:opacity-80 active:opacity-70",
                  isNav ? "w-[4.25rem] sm:w-[4.5rem]" : "w-[4.5rem] sm:w-[4.75rem]",
                  active && "opacity-100",
                )}
                draggable={false}
              >
                <span
                  className={cn(
                    "relative overflow-hidden rounded-xl bg-muted/60",
                    isNav ? "size-14 sm:size-[3.75rem]" : "size-16 sm:size-[4.5rem]",
                    active && "ring-2 ring-foreground/15",
                  )}
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-contain p-1.5"
                      sizes={isNav ? "60px" : "72px"}
                      draggable={false}
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "mt-1.5 w-full text-center font-medium text-foreground",
                    isNav
                      ? "line-clamp-2 text-[11px] leading-tight sm:text-xs"
                      : "line-clamp-2 text-xs leading-snug sm:text-[13px]",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>

        {chevronsVisible ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              "absolute right-0 top-1/2 z-10 hidden size-8 -translate-y-1/2 rounded-full bg-background/90 shadow-sm md:inline-flex",
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
    </section>
  )
}
