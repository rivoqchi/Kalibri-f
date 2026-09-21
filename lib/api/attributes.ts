import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export type AdminAttribute = {
  id: string
  name: string
  value: string
  unit: string
  slug: string
  isActive: boolean
}

export type AttributeWriteBody = {
  name?: string
  value?: string
  unit?: string
  isActive?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listAdminAttributes(token: string) {
  return apiFetch<AdminAttribute[]>(endpoints.attributes.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function createAttribute(
  token: string,
  body: { name: string; value: string; unit: string },
) {
  return apiFetch<AdminAttribute>(endpoints.attributes.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function updateAttribute(
  token: string,
  id: string,
  body: AttributeWriteBody,
) {
  return apiFetch<AdminAttribute>(endpoints.attributes.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function deleteAttribute(token: string, id: string) {
  return apiFetch<{ ok: boolean; id: string }>(
    endpoints.attributes.byId(id),
    {
      method: "DELETE",
      headers: authHeaders(token),
      revalidate: false,
    },
  )
}
