"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ProductCartControls } from "@/components/store/product-cart-controls"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { useCartStore } from "@/hooks/use-cart"
import { authErrorMessage } from "@/lib/api/auth"
import { createOrder } from "@/lib/api/orders"
import {
  calcInstallmentMonthly,
  listPartners,
  type StorePartner,
} from "@/lib/api/partners"
import { formatSom } from "@/lib/api/products"
import { useAuthStore } from "@/lib/auth/store"
import { rememberNavigationToProduct } from "@/lib/store-scroll"
import { cn } from "@/lib/utils"

export function CartPageClient() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)

  const [partners, setPartners] = React.useState<StorePartner[]>([])
  const [partnersLoading, setPartnersLoading] = React.useState(true)
  const [partnerId, setPartnerId] = React.useState<string | null>(null)
  const [month, setMonth] = React.useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    setPartnersLoading(true)
    listPartners()
      .then((list) => {
        if (!cancelled) setPartners(list)
      })
      .catch(() => {
        if (!cancelled) setPartners([])
      })
      .finally(() => {
        if (!cancelled) setPartnersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const usable = React.useMemo(
    () => partners.filter((p) => p.isActive && p.months.length > 0),
    [partners],
  )

  const selected = usable.find((p) => p.id === partnerId) ?? null
  const monthOptions = selected?.months ?? []
  const selectedMonth = monthOptions.find((m) => m.month === month) ?? null

  const cartTotal = items.reduce(
    (sum, item) => sum + item.unitPrice.amount * item.quantity,
    0,
  )

  const monthly =
    selectedMonth != null && cartTotal > 0
      ? calcInstallmentMonthly(
          cartTotal,
          selectedMonth.month,
          selectedMonth.percent,
        )
      : NaN

  function selectPartner(partner: StorePartner) {
    setPartnerId(partner.id)
    setMonth(partner.months[0]?.month ?? null)
  }

  function openConfirm() {
    if (!token) {
      router.push(`/login?next=${encodeURIComponent("/cart")}`)
      return
    }
    if (!items.length || !partnerId || selectedMonth == null) return
    setConfirmOpen(true)
  }

  async function submitOrder() {
    if (!token || !partnerId || selectedMonth == null || !items.length) return
    setSubmitting(true)
    const payload = {
      partnerId,
      months: selectedMonth.month,
      items: items.map((item) => ({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        quantity: item.quantity,
        unitPrice: {
          amount: Number(item.unitPrice.amount),
          currency: item.unitPrice.currency || "UZS",
        },
        imageUrl: item.imageUrl,
      })),
    }
    // #region agent log
    void fetch("/api/health/client-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hypothesisId: "A",
        location: "cart-page.tsx:submitOrder",
        message: "checkout payload before createOrder",
        runId: "post-fix",
        data: {
          partnerId: payload.partnerId,
          months: payload.months,
          itemsLen: payload.items.length,
          unitPrice: payload.items[0]?.unitPrice,
          unitPriceKeys: Object.keys(payload.items[0]?.unitPrice ?? {}),
        },
      }),
    }).catch(() => {})
    // #endregion
    try {
      await createOrder(token, payload)
      // #region agent log
      void fetch("/api/health/client-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hypothesisId: "A",
          location: "cart-page.tsx:submitOrder:ok",
          message: "createOrder succeeded",
          runId: "post-fix",
          data: { unitPriceKeys: Object.keys(payload.items[0]?.unitPrice ?? {}) },
        }),
      }).catch(() => {})
      // #endregion
      clear()
      setConfirmOpen(false)
      setPartnerId(null)
      setMonth(null)
      router.push("/profile?section=orders")
    } catch (error) {
      // #region agent log
      const errBody =
        error && typeof error === "object" && "body" in error
          ? (error as { body: unknown }).body
          : null
      const errStatus =
        error && typeof error === "object" && "status" in error
          ? (error as { status: number }).status
          : null
      void fetch("/api/health/client-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hypothesisId: "A,B,C,D,E",
          location: "cart-page.tsx:submitOrder:catch",
          message: "createOrder failed",
          runId: "post-fix",
          data: { status: errStatus, body: errBody },
        }),
      }).catch(() => {})
      // #endregion
      toast.error(authErrorMessage(error, "Xato"))
    } finally {
      setSubmitting(false)
    }
  }

  const canCheckout =
    items.length > 0 && partnerId != null && selectedMonth != null && Number.isFinite(monthly)

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
      <Toaster position="bottom-center" />

      {items.length === 0 ? null : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const href = `/products/${item.slug}`
            return (
              <li
                key={item.productId}
                className="flex gap-3 border-b border-border pb-3 last:border-0"
              >
                <Link
                  href={href}
                  onClick={rememberNavigationToProduct}
                  className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-24"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : null}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    href={href}
                    onClick={rememberNavigationToProduct}
                    className="line-clamp-2 text-sm font-medium text-foreground"
                  >
                    {item.name}
                  </Link>
                  <Link
                    href={href}
                    onClick={rememberNavigationToProduct}
                    className="text-sm text-muted-foreground"
                  >
                    {formatSom(item.unitPrice.amount)} so&apos;m
                  </Link>
                  <ProductCartControls
                    productId={item.productId}
                    slug={item.slug}
                    name={item.name}
                    unitPrice={item.unitPrice}
                    imageUrl={item.imageUrl}
                    inStock
                    variant="card"
                    className="mt-auto max-w-[9.5rem]"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Hamkorlar</p>

          {partnersLoading ? (
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-36 shrink-0 rounded-2xl" />
              ))}
            </div>
          ) : usable.length === 0 ? null : (
            <>
              <div
                className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="listbox"
                aria-label="Hamkorlar"
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
                      <span className="max-w-[7.5rem] truncate text-sm font-medium sm:max-w-[10rem]">
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
                    <p className="text-base font-semibold tracking-tight sm:text-lg">
                      Oyiga {formatSom(monthly)} so&apos;m
                    </p>
                  ) : null}
                </div>
              ) : null}
            </>
          )}

          <Button
            type="button"
            size="lg"
            className="mt-2 h-12 w-full"
            disabled={!canCheckout || submitting}
            onClick={openConfirm}
          >
            Rasmiylashtirish
          </Button>
        </div>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tasdiqlaysizmi?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              disabled={submitting}
              onClick={() => setConfirmOpen(false)}
            >
              Bekor
            </Button>
            <Button
              type="button"
              className="h-11 flex-1"
              disabled={submitting}
              onClick={() => void submitOrder()}
            >
              Rasmiylashtirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
