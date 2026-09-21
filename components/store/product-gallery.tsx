"use client"

import * as React from "react"
import Image from "next/image"
import { IconHeart, IconHeartFilled } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { useFavoritesStore } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

const AUTO_MS = 5000
const DRAG_THRESHOLD = 48

export function ProductGallery({
  productId,
  name,
  images,
}: {
  productId: string
  name: string
  images: string[]
}) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [dragX, setDragX] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const thumbsRef = React.useRef<HTMLDivElement>(null)
  const thumbBtnRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const pointerIdRef = React.useRef<number | null>(null)
  const draggingRef = React.useRef(false)
  const activeIndexRef = React.useRef(0)
  const startXRef = React.useRef(0)
  const startDragRef = React.useRef(0)
  const liked = useFavoritesStore((s) => s.has(productId))
  const toggleFavorite = useFavoritesStore((s) => s.toggle)

  const safeImages = images.length > 0 ? images : []
  const count = safeImages.length

  activeIndexRef.current = activeIndex

  React.useEffect(() => {
    setActiveIndex(0)
    setDragX(0)
    setDragging(false)
    draggingRef.current = false
    pointerIdRef.current = null
  }, [productId])

  React.useEffect(() => {
    if (count <= 1 || dragging) return
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [count, dragging, activeIndex])

  React.useEffect(() => {
    const viewport = viewportRef.current
    const strip = thumbsRef.current
    if (!viewport || !strip || count <= 1) return

    const syncHeight = () => {
      const isMd = window.matchMedia("(min-width: 768px)").matches
      if (!isMd) {
        strip.style.removeProperty("height")
        strip.style.removeProperty("max-height")
        return
      }
      const h = viewport.offsetHeight
      if (h > 0) {
        strip.style.height = `${h}px`
        strip.style.maxHeight = `${h}px`
      }
    }

    syncHeight()
    const ro = new ResizeObserver(syncHeight)
    ro.observe(viewport)
    window.addEventListener("resize", syncHeight)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", syncHeight)
    }
  }, [count, productId])

  React.useEffect(() => {
    const thumb = thumbBtnRefs.current[activeIndex]
    const strip = thumbsRef.current
    if (!thumb || !strip) return

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth"

    const thumbTop = thumb.offsetTop
    const thumbLeft = thumb.offsetLeft
    const thumbBottom = thumbTop + thumb.offsetHeight
    const thumbRight = thumbLeft + thumb.offsetWidth
    const viewTop = strip.scrollTop
    const viewLeft = strip.scrollLeft
    const viewBottom = viewTop + strip.clientHeight
    const viewRight = viewLeft + strip.clientWidth

    if (strip.scrollHeight > strip.clientHeight + 1) {
      if (thumbTop < viewTop) {
        strip.scrollTo({ top: thumbTop, behavior })
      } else if (thumbBottom > viewBottom) {
        strip.scrollTo({ top: thumbBottom - strip.clientHeight, behavior })
      }
      return
    }

    if (thumbLeft < viewLeft) {
      strip.scrollTo({ left: thumbLeft, behavior })
    } else if (thumbRight > viewRight) {
      strip.scrollTo({ left: thumbRight - strip.clientWidth, behavior })
    }
  }, [activeIndex])

  function goTo(next: number) {
    if (count <= 0) return
    setActiveIndex(((next % count) + count) % count)
  }

  function selectThumb(index: number) {
    setActiveIndex(index)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (count <= 1) return
    if (event.button !== 0 && event.pointerType === "mouse") return

    pointerIdRef.current = event.pointerId
    startXRef.current = event.clientX
    startDragRef.current = 0
    draggingRef.current = true
    setDragging(true)
    setDragX(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId || !draggingRef.current) return
    const delta = event.clientX - startXRef.current
    startDragRef.current = delta
    setDragX(delta)
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) return
    const width = viewportRef.current?.clientWidth ?? 1
    const delta = startDragRef.current
    pointerIdRef.current = null
    draggingRef.current = false
    setDragging(false)
    setDragX(0)

    if (Math.abs(delta) >= Math.min(DRAG_THRESHOLD, width * 0.18)) {
      goTo(activeIndexRef.current + (delta < 0 ? 1 : -1))
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* already released */
    }
  }

  const offsetPercent = -activeIndex * 100
  const viewportWidth = viewportRef.current?.clientWidth ?? 0
  const dragPercent =
    dragging && viewportWidth > 0 ? (dragX / viewportWidth) * 100 : 0

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-start md:gap-4">
      {count > 1 ? (
        <div
          ref={thumbsRef}
          className={cn(
            "order-2 flex min-w-0 max-w-full gap-2 overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "md:order-1 md:w-16 md:max-w-none md:shrink-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:self-start",
          )}
          role="list"
        >
          {safeImages.map((src, index) => {
            const active = index === activeIndex
            return (
              <button
                key={`${src}-${index}`}
                ref={(node) => {
                  thumbBtnRefs.current[index] = node
                }}
                type="button"
                role="listitem"
                aria-label={`${index + 1}`}
                aria-pressed={active}
                onClick={() => selectThumb(index)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted transition-[opacity,transform] duration-200 ease-out active:scale-[0.98]",
                  active ? "opacity-100 scale-[1.03]" : "opacity-45",
                )}
              >
                <span className="relative block size-full">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="size-full object-cover pointer-events-none"
                    sizes="72px"
                    draggable={false}
                  />
                </span>
              </button>
            )
          })}
        </div>
      ) : null}

      <div
        ref={viewportRef}
        className={cn(
          "relative order-1 aspect-square w-full min-w-0 overflow-hidden rounded-2xl bg-muted select-none md:order-2 md:min-w-0 md:flex-1 md:aspect-[4/5] md:max-h-[min(70vh,560px)]",
          count > 1 && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={{ touchAction: count > 1 ? "pan-y" : "auto" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {count > 0 ? (
          <div
            className={cn(
              "flex h-full w-full min-w-0",
              !dragging && "transition-transform duration-500 ease-out",
            )}
            style={{
              transform: `translate3d(calc(${offsetPercent}% + ${dragPercent}%), 0, 0)`,
              willChange: "transform",
            }}
          >
            {safeImages.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-full w-full shrink-0 grow-0 basis-full"
              >
                <Image
                  src={src}
                  alt={index === activeIndex ? name : ""}
                  fill
                  priority={index === 0}
                  className="size-full object-cover pointer-events-none"
                  sizes="(max-width: 768px) 95vw, (max-width: 1024px) 45vw, 50vw"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-muted" aria-hidden />
        )}

        <Button
          type="button"
          variant="secondary"
          size="icon-lg"
          aria-label="Favorite"
          aria-pressed={liked}
          className={cn(
            "absolute top-3 right-3 z-10 size-11 rounded-full border-0 bg-background text-foreground shadow-sm transition-transform duration-200 hover:bg-background active:scale-95",
            liked && "text-destructive",
          )}
          onPointerDown={(event) => {
            event.stopPropagation()
          }}
          onClick={() => toggleFavorite(productId)}
        >
          {liked ? (
            <IconHeartFilled className="size-5" />
          ) : (
            <IconHeart className="size-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
