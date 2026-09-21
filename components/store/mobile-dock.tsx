"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconHeart,
  IconHome,
  IconLayoutGrid,
  IconMessageChatbot,
  IconUser,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const glassDock =
  "border-t border-border/60 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60"

type DockItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  match?: (pathname: string) => boolean
}

const items: DockItem[] = [
  {
    href: "/",
    label: "Bosh sahifa",
    icon: IconHome,
    match: (pathname) => pathname === "/",
  },
  {
    href: "/catalog",
    label: "Kataloglar",
    icon: IconLayoutGrid,
    match: (pathname) => pathname.startsWith("/catalog"),
  },
  {
    href: "/favorites",
    label: "Yoqtirganlari",
    icon: IconHeart,
    match: (pathname) => pathname.startsWith("/favorites"),
  },
  {
    href: "/ai",
    label: "AI so‘rash",
    icon: IconMessageChatbot,
    match: (pathname) => pathname.startsWith("/ai"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: IconUser,
    match: (pathname) => pathname.startsWith("/profile"),
  },
]

export function MobileDock() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "pb-[env(safe-area-inset-bottom)]",
        glassDock,
      )}
      aria-label="Asosiy navigatsiya"
    >
      <div
        className="mx-auto grid h-[var(--store-dock-height)] max-w-lg grid-cols-5"
        role="list"
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.match?.(pathname) ?? pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              role="listitem"
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] leading-tight transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <Icon className="size-5" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
