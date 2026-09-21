"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"

import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster } from "@/components/ui/sonner"
import { authErrorMessage } from "@/lib/api/auth"
import {
  listOrders,
  updateOrderStatus,
  type Order,
} from "@/lib/api/orders"
import { formatSom } from "@/lib/api/products"

export function ProfileOrders({ token }: { token: string }) {
  const [items, setItems] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const list = await listOrders(token)
      setItems(list)
    } catch (error) {
      toast.error(authErrorMessage(error, "Xato"))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    void load()
  }, [load])

  async function cancelOrder(id: string) {
    setPendingId(id)
    try {
      const next = await updateOrderStatus(token, id, "cancelled")
      setItems((prev) => prev.map((item) => (item.id === id ? next : item)))
    } catch (error) {
      toast.error(authErrorMessage(error, "Xato"))
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Toaster position="bottom-center" />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Toaster position="bottom-center" />
      <ul className="flex flex-col gap-4">
        {items.map((order) => (
          <li
            key={order.id}
            className="flex flex-col gap-3 border-b border-border pb-4 last:border-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{order.partnerName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {order.months} · Oyiga {formatSom(order.monthlyAmount)}{" "}
                  so&apos;m
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <ul className="flex flex-col gap-2">
              {order.items.map((item) => (
                <li
                  key={`${order.id}-${item.productId}`}
                  className="flex items-center gap-2.5"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {item.quantity}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {order.status === "pending" ? (
              <Button
                type="button"
                variant="destructive"
                className="h-11 w-full sm:w-auto"
                disabled={pendingId === order.id}
                onClick={() => void cancelOrder(order.id)}
              >
                Bekor qilish
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
