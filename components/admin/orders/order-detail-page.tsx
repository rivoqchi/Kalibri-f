"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { authErrorMessage } from "@/lib/api/auth"
import {
  getOrder,
  updateOrderStatus,
  type Order,
} from "@/lib/api/orders"
import { formatSom } from "@/lib/api/products"
import { useAuthStore } from "@/lib/auth/store"

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const token = useAuthStore((state) => state.token)
  const router = useRouter()
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [pending, setPending] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const next = await getOrder(token, orderId)
      setOrder(next)
    } catch (error) {
      toast.error(authErrorMessage(error, "Xato"))
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [token, orderId])

  React.useEffect(() => {
    void load()
  }, [load])

  async function setStatus(status: "confirmed" | "cancelled") {
    if (!token || !order) return
    setPending(true)
    try {
      const next = await updateOrderStatus(token, order.id, status)
      setOrder(next)
    } catch (error) {
      toast.error(authErrorMessage(error, "Xato"))
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <Button type="button" variant="outline" onClick={() => router.push("/admin/orders")}>
        Buyurtmalar
      </Button>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium tracking-tight md:text-xl">
          Buyurtma
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="flex flex-col gap-3">
        {order.items.map((item) => (
          <li key={`${item.productId}-${item.slug}`} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-20">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.quantity} × {formatSom(item.unitPrice.amount)} so&apos;m
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1.5 text-sm">
        <p>
          <span className="text-muted-foreground">Hamkor: </span>
          {order.partnerName}
        </p>
        <p>
          <span className="text-muted-foreground">Oy: </span>
          {order.months}
        </p>
        <p className="text-base font-semibold">
          Oyiga {formatSom(order.monthlyAmount)} so&apos;m
        </p>
      </div>

      {order.status === "pending" ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="destructive"
            className="h-11 flex-1"
            disabled={pending}
            onClick={() => void setStatus("cancelled")}
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={pending}
            onClick={() => void setStatus("confirmed")}
          >
            Tasdiqlash
          </Button>
        </div>
      ) : null}
    </div>
  )
}
