"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import type { HomeAd } from "@/lib/api/home-ads"
import { cn } from "@/lib/utils"

const AUTO_MS = 3000
const DRAG_THRESHOLD = 48

function isExternal(link: string) {
  return /^https?:\/\//i.test(link)
}

export function HomeBannerCarousel({ ads }: { ads: HomeAd[] }) {
  const count = ads.length
  const [index, setIndex] = React.useState(0)
  const [dragX, setDragX] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const pointerIdRef = React.useRef<number | null>(null)
  const startXRef = React.useRef(0)
  const startDragRef = React.useRef(0)
  const movedRef = React.useRef(false)

  React.useEffect(() => {
    if (count <= 1 || paused || dragging) return
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count)
    }, AUTO_MS)
    return () => window.clearInterval(id)
  }, [count, paused, dragging])

  function goTo(next: number) {
    if (count <= 0) return
    setIndex(((next % count) + count) % count)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (count <= 1) return
    pointerIdRef.current = event.pointerId
    startXRef.current = event.clientX
    startDragRef.current = 0
    movedRef.current = false
    setDragging(true)
    setPaused(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId || !dragging) return
    const delta = event.clientX - startXRef.current
    startDragRef.current = delta
    if (Math.abs(delta) > 6) movedRef.current = true
    setDragX(delta)
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) return
    const width = trackRef.current?.clientWidth ?? 1
    const delta = startDragRef.current
    pointerIdRef.current = null
    setDragging(false)
    setDragX(0)
    setPaused(false)

    if (Math.abs(delta) >= Math.min(DRAG_THRESHOLD, width * 0.18)) {
      goTo(index + (delta < 0 ? 1 : -1))
    }

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* already released */
    }
  }

  function onSlideClick(event: React.MouseEvent) {
    if (movedRef.current) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  if (count === 0) return null

  const offsetPercent = -index * 100
  const dragPercent =
    dragging && trackRef.current?.clientWidth
      ? (dragX / trackRef.current.clientWidth) * 100
      : 0

  return (
    <div
      className="relative w-full min-w-0 overflow-hidden rounded-2xl bg-muted touch-pan-y select-none"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        if (!dragging) setPaused(false)
      }}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex w-full min-w-0",
          dragging ? "cursor-grabbing" : "cursor-grab",
          !dragging && "transition-transform duration-500 ease-out",
        )}
        style={{
          transform: `translate3d(calc(${offsetPercent}% + ${dragPercent}%), 0, 0)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {ads.map((ad) => {
          const slide = (
            <span className="relative block aspect-[16/8] w-full sm:aspect-[21/8] md:aspect-[24/8]">
              <Image
                src={ad.imageUrl}
                alt=""
                fill
                className="object-cover pointer-events-none"
                sizes="(max-width: 768px) 95vw, 80vw"
                priority={ad.id === ads[0]?.id}
                draggable={false}
              />
            </span>
          )

          return (
            <div key={ad.id} className="w-full shrink-0 grow-0 basis-full">
              {isExternal(ad.link) ? (
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  onClick={onSlideClick}
                  draggable={false}
                >
                  {slide}
                </a>
              ) : (
                <Link
                  href={ad.link || "/"}
                  className="block"
                  onClick={onSlideClick}
                  draggable={false}
                >
                  {slide}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
