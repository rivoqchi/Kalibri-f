"use client"

import * as React from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  calcInstallmentMonthly,
  type StorePartner,
} from "@/lib/api/partners"
import { formatSom } from "@/lib/api/products"
import { cn } from "@/lib/utils"

type ProductInstallmentProps = {
  priceAmount: number
  partners: StorePartner[]
}

export function ProductInstallment({
  priceAmount,
  partners,
}: ProductInstallmentProps) {
  const usable = React.useMemo(
    () => partners.filter((p) => p.isActive && p.months.length > 0),
    [partners],
  )

  const [partnerId, setPartnerId] = React.useState<string | null>(null)
  const [month, setMonth] = React.useState<number | null>(null)

  const selected = usable.find((p) => p.id === partnerId) ?? null
  const monthOptions = selected?.months ?? []
  const selectedMonth = monthOptions.find((m) => m.month === month) ?? null
  const monthly =
    selectedMonth != null
      ? calcInstallmentMonthly(
          priceAmount,
          selectedMonth.month,
          selectedMonth.percent,
        )
      : NaN

  if (usable.length === 0) return null

  function selectPartner(partner: StorePartner) {
    setPartnerId(partner.id)
    setMonth(partner.months[0]?.month ?? null)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">Hamkor tanlash</p>

      <div
        className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Hamkor tanlash"
      >
        {usable.map((partner) => {
          const active = partner.id === partnerId
          return (
            <button
              key={partner.id}
              type="button"
              role="option"
              aria-selected={active}
              aria-label={partner.name}
              onClick={() => selectPartner(partner)}
              className={cn(
                "flex h-14 shrink-0 items-center gap-2.5 rounded-2xl border bg-background px-2.5 transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
                active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-muted/60",
              )}
            >
              <span className="relative size-10 overflow-hidden rounded-full bg-muted">
                {partner.imageUrl ? (
                  <Image
                    src={partner.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </span>
              <span className="max-w-[7.5rem] truncate text-sm font-medium text-foreground sm:max-w-[10rem]">
                {partner.name}
              </span>
            </button>
          )
        })}
      </div>

      {selected ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-muted-foreground">Oy</p>
          <div className="flex flex-wrap gap-2">
            {monthOptions.map((option) => {
              const active = option.month === month
              return (
                <Button
                  key={option.month}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="lg"
                  className="h-11 min-w-14 px-4"
                  aria-pressed={active}
                  onClick={() => setMonth(option.month)}
                >
                  {option.month}
                </Button>
              )
            })}
          </div>

          {Number.isFinite(monthly) ? (
            <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Oyiga {formatSom(monthly)} so&apos;m
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
