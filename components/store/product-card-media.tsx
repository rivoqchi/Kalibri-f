"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { rememberNavigationToProduct } from "@/lib/store-scroll"
import { cn } from "@/lib/utils"

const SWIPE_THRESHOLD_PX = 36

function indexFromClientX(clientX: number, width: number, left: number, count: number) {
  if (count <= 1 || width <= 0) return 0
  const ratio = (clientX - left) / width
  const clamped = Math.min(Math.max(ratio, 0), 0.999999)
  return Math.floor(clamped * count)
}

export function ProductCardMedia({
  href,
  name,
  images,
  compact = false,
  sizes,
}: {
  href: string
  name: string
  images: string[]
  compact?: boolean
  sizes: string
}) {
  const count = images.length
  const multi = count > 1
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [seen, setSeen] = React.useState(() => new Set([0]))
  const rootRef = React.useRef<HTMLAnchorElement>(null)
  const touchStartXRef = React.useRef<number | null>(null)
  const touchStartYRef = React.useRef<number | null>(null)
  const swipingRef = React.useRef(false)
  const suppressClickRef = React.useRef(false)
  const activeIndexRef = React.useRef(0)

  activeIndexRef.current = activeIndex
  const imagesKey = images.join("\0")

  React.useEffect(() => {
    setActiveIndex(0)
    setSeen(new Set([0]))
    touchStartXRef.current = null
    touchStartYRef.current = null
    swipingRef.current = false
    suppressClickRef.current = false
  }, [href, imagesKey])

  function goTo(next: number) {
    if (!multi) return
    const clamped = ((next % count) + count) % count
    if (clamped === activeIndexRef.current) return
    setActiveIndex(clamped)
    setSeen((prev) => {
      if (prev.has(clamped)) return prev
      const nextSeen = new Set(prev)
      nextSeen.add(clamped)
      return nextSeen
    })
  }

  function revealAll() {
    setSeen((prev) => {
      if (prev.size >= count) return prev
      return new Set(Array.from({ length: count }, (_, i) => i))
    })
  }

  function scrubFromClientX(clientX: number) {
    const el = rootRef.current
    if (!el || !multi) return
    const rect = el.getBoundingClientRect()
    goTo(indexFromClientX(clientX, rect.width, rect.left, count))
  }

  function onMouseEnter() {
    if (!multi) return
    revealAll()
  }

  function onMouseMove(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!multi) return
    scrubFromClientX(event.clientX)
  }

  function onMouseLeave() {
    if (!multi) return
    goTo(0)
  }

  function onTouchStart(event: React.TouchEvent<HTMLAnchorElement>) {
    if (!multi || event.touches.length !== 1) return
    const touch = event.touches[0]
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    swipingRef.current = false
  }

  function onTouchMove(event: React.TouchEvent<HTMLAnchorElement>) {
    if (!multi || touchStartXRef.current == null || touchStartYRef.current == null) {
      return
    }
    const touch = event.touches[0]
    const dx = touch.clientX - touchStartXRef.current
    const dy = touch.clientY - touchStartYRef.current
    if (!swipingRef.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      // Prefer vertical scroll when gesture is mostly vertical.
      if (Math.abs(dy) > Math.abs(dx)) {
        touchStartXRef.current = null
        touchStartYRef.current = null
        return
      }
      swipingRef.current = true
    }
  }

  function onTouchEnd(event: React.TouchEvent<HTMLAnchorElement>) {
    if (!multi || touchStartXRef.current == null) {
      touchStartXRef.current = null
      touchStartYRef.current = null
      swipingRef.current = false
      return
    }

    const touch = event.changedTouches[0]
    const dx = touch.clientX - touchStartXRef.current
    touchStartXRef.current = null
    touchStartYRef.current = null

    if (swipingRef.current && Math.abs(dx) >= SWIPE_THRESHOLD_PX) {
      const next = activeIndexRef.current + (dx < 0 ? 1 : -1)
      const wrap = (i: number) => ((i % count) + count) % count
      // Warm neighbor slots so the next swipe does not flash empty.
      setSeen((prev) => {
        const warm = new Set(prev)
        warm.add(wrap(next))
        warm.add(wrap(next + 1))
        warm.add(wrap(next - 1))
        return warm
      })
      goTo(next)
      suppressClickRef.current = true
    }
    swipingRef.current = false
  }

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (suppressClickRef.current) {
      event.preventDefault()
      event.stopPropagation()
      suppressClickRef.current = false
      return
    }
    rememberNavigationToProduct()
  }

  return (
    <>
      <Link
        ref={rootRef}
        href={href}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={() => {
          touchStartXRef.current = null
          touchStartYRef.current = null
          swipingRef.current = false
        }}
        className="absolute inset-0 block outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
        style={{ touchAction: multi ? "pan-y" : undefined }}
      >
        {count > 0 ? (
          images.map((src, index) => {
            if (!seen.has(index) && index !== activeIndex) return null
            const active = index === activeIndex
            return (
              <Image
                key={`${src}-${index}`}
                src={src}
                alt={active ? name : ""}
                fill
                sizes={sizes}
                draggable={false}
                className={cn(
                  "object-cover transition-[opacity,transform] duration-100 ease-out will-change-[opacity,transform] group-hover/product:scale-[1.04]",
                  active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                priority={index === 0}
              />
            )
          })
        ) : (
          <span className="absolute inset-0 bg-muted" aria-hidden />
        )}
      </Link>

      {multi ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-[5] flex",
            compact ? "bottom-1.5 gap-0.5 px-1.5" : "bottom-2 gap-1 px-2",
          )}
          aria-hidden
        >
          {images.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-[2px] min-w-0 flex-1 rounded-[1px] transition-colors duration-100",
                index === activeIndex ? "bg-neutral-800" : "bg-neutral-300",
              )}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
