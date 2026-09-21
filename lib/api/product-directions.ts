import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { uploadMediaImage } from "@/lib/api/media"

export type StoreProductDirection = {
  id: string
  name: string
  imageUrl: string
  productIds: string[]
  isActive: boolean
}

export type AdminProductDirection = StoreProductDirection

export type ProductDirectionWriteBody = {
  name?: string
  imageUrl?: string
  productIds?: string[]
  isActive?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listProductDirections() {
  return apiFetch<StoreProductDirection[]>(endpoints.productDirections.list, {
    revalidate: 60,
    tags: ["product-directions"],
  })
}

export function listAdminProductDirections(token: string) {
  return apiFetch<AdminProductDirection[]>(endpoints.productDirections.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function createProductDirection(
  token: string,
  body: {
    name: string
    imageUrl: string
    productIds?: string[]
    isActive?: boolean
  },
) {
  return apiFetch<AdminProductDirection>(endpoints.productDirections.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function updateProductDirection(
  token: string,
  id: string,
  body: ProductDirectionWriteBody,
) {
  return apiFetch<AdminProductDirection>(
    endpoints.productDirections.byId(id),
    {
      method: "PATCH",
      headers: authHeaders(token),
      body,
      revalidate: false,
    },
  )
}

export async function uploadProductDirectionImage(token: string, file: File) {
  return uploadMediaImage(token, file, "directions")
}
