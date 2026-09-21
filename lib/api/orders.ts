import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export type OrderStatus = "pending" | "confirmed" | "cancelled"

export type OrderMoney = {
  amount: number
  currency: string
}

export type OrderItem = {
  productId: string
  slug: string
  name: string
  quantity: number
  unitPrice: OrderMoney
  imageUrl?: string
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  partnerId: string
  partnerName: string
  months: number
  percent: number
  monthlyAmount: number
  totalAmount: number
  currency: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export type CreateOrderBody = {
  items: OrderItem[]
  partnerId: string
  months: number
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  cancelled: "Bekor qilingan",
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function createOrder(token: string, body: CreateOrderBody) {
  return apiFetch<Order>(endpoints.orders.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function listOrders(token: string) {
  return apiFetch<Order[]>(endpoints.orders.list, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function listAdminOrders(token: string) {
  return apiFetch<Order[]>(endpoints.orders.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function getOrder(token: string, id: string) {
  return apiFetch<Order>(endpoints.orders.byId(id), {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function updateOrderStatus(
  token: string,
  id: string,
  status: OrderStatus,
) {
  return apiFetch<Order>(endpoints.orders.status(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body: { status },
    revalidate: false,
  })
}
