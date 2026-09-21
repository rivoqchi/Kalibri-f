import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export function fetchAdminPanel(token: string) {
  return apiFetch<{ ok: true }>(endpoints.admin.panel, {
    headers: { Authorization: `Bearer ${token}` },
    revalidate: false,
  })
}
