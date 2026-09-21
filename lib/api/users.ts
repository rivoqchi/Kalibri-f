import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export type AdminUser = {
  id: string
  telegramId: number
  username: string | null
  firstName: string
  lastName: string
  phone: string | null
  role: string
  fullName: string
  photoUrl: string | null
  photoCustom: boolean
  photoRevision: number
  isBlocked: boolean
}

export type UpdateAdminUserBody = {
  isBlocked?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listAdminUsers(token: string) {
  return apiFetch<AdminUser[]>(endpoints.users.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function updateAdminUser(
  token: string,
  id: string,
  body: UpdateAdminUserBody,
) {
  return apiFetch<AdminUser>(endpoints.users.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}
