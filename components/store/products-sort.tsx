"use client"

import { useTransition } from "react"
import {
  IconArrowsSort,
  IconClock,
  IconFlame,
  IconSortAscendingNumbers,
  IconSortDescendingNumbers,
} from "@tabler/icons-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const SORT_ALL = "all"

const SORT_OPTIONS = [
  {
    value: SORT_ALL,
    label: "Hammasi",
    Icon: IconArrowsSort,
  },
  {
    value: "newest",
    label: "Yangilari",
    Icon: IconClock,
  },
  {
    value: "price_asc",
    label: "Arzonroq",
    Icon: IconSortAscendingNumbers,
  },
  {
    value: "price_desc",
    label: "Qimmatroq",
    Icon: IconSortDescendingNumbers,
  },
  {
    value: "bestseller",
    label: "Ko‘p sotilgan",
    Icon: IconFlame,
  },
] as const

type ProductsSortProps = {
  value?: string
  className?: string
}

export function ProductsSort({ value, className }: ProductsSortProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const sortValue = value && value !== SORT_ALL ? value : SORT_ALL
  const selected =
    SORT_OPTIONS.find((o) => o.value === sortValue) ?? SORT_OPTIONS[0]
  const SelectedIcon = selected.Icon

  function onNavigate(nextSort: string | null) {
    const next = new URLSearchParams(searchParams.toString())
    if (nextSort == null || nextSort === "" || nextSort === SORT_ALL) {
      next.delete("sort")
    } else {
      next.set("sort", nextSort)
    }
    next.delete("page")
    const qs = next.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
        Avval ko&apos;rsatish
      </h2>
      <Select
        value={sortValue}
        onValueChange={(next) => {
          if (next === null) return
          onNavigate(next === SORT_ALL ? null : next)
        }}
      >
        <SelectTrigger className="h-11 w-full rounded-2xl bg-input/50 px-3 sm:w-[min(100%,16.5rem)]">
          <SelectedIcon className="size-4 shrink-0 text-muted-foreground" />
          <SelectValue>
            {(selectedValue: string | null) =>
              SORT_OPTIONS.find((o) => o.value === (selectedValue ?? SORT_ALL))
                ?.label ?? "Hammasi"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="end">
          {SORT_OPTIONS.map((option) => {
            const OptionIcon = option.Icon
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="min-h-10 gap-2"
              >
                <OptionIcon className="size-4 shrink-0 text-muted-foreground" />
                {option.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </section>
  )
}
