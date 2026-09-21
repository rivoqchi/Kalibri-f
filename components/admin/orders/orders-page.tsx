"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authErrorMessage } from "@/lib/api/auth"
import {
  listAdminOrders,
  type Order,
} from "@/lib/api/orders"
import { formatSom } from "@/lib/api/products"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6

export function OrdersPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<Order[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminOrders(token)
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-medium tracking-tight md:text-xl">
        Buyurtmalar
      </h1>

      <div className="overflow-x-auto rounded-2xl border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahsulot</TableHead>
              <TableHead>Hamkor</TableHead>
              <TableHead>Oy</TableHead>
              <TableHead>Oyiga</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : items.map((order) => {
                  const first = order.items[0]
                  const extra = order.items.length - 1
                  return (
                    <TableRow key={order.id} className="cursor-pointer">
                      <TableCell>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-3"
                        >
                          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {first?.imageUrl ? (
                              <Image
                                src={first.imageUrl}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="line-clamp-1 text-sm font-medium">
                              {first?.name ?? "—"}
                            </span>
                            {extra > 0 ? (
                              <span className="text-xs text-muted-foreground">
                                +{extra}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.partnerName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.months}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          {formatSom(order.monthlyAmount)} so&apos;m
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`}>
                          <OrderStatusBadge status={order.status} />
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
