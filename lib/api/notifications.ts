import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export type AdminNotification = {
  id: string
  message: string
  orderId: string
  audience: string
  read: boolean
  createdAt: string
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listNotifications(token: string) {
  return apiFetch<AdminNotification[]>(endpoints.notifications.list, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function markNotificationRead(token: string, id: string) {
  return apiFetch<AdminNotification>(endpoints.notifications.read(id), {
    method: "PATCH",
    headers: authHeaders(token),
    revalidate: false,
  })
}
