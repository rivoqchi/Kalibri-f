import * as React from "react"
import { IconChevronLeft, IconChevronRight, IconDots } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  size?: React.ComponentProps<typeof Button>["size"]
} & React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn("min-h-11 min-w-11 rounded-2xl sm:min-h-9 sm:min-w-9", className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Oldingi"
      size="default"
      className={cn("gap-1 px-3 pl-2.5!", className)}
      {...props}
    >
      <IconChevronLeft className="cn-rtl-flip size-4" data-icon="inline-start" />
      <span className="hidden sm:inline">Oldingi</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Keyingi"
      size="default"
      className={cn("gap-1 px-3 pr-2.5!", className)}
      {...props}
    >
      <span className="hidden sm:inline">Keyingi</span>
      <IconChevronRight className="cn-rtl-flip size-4" data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-11 items-center justify-center sm:size-9 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <IconDots />
      <span className="sr-only">…</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
