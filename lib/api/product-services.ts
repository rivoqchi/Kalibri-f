import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { uploadMediaImage } from "@/lib/api/media"

export type StoreProductService = {
  id: string
  name: string
  imageUrl: string
  phone: string
  isActive: boolean
}

export type AdminProductService = StoreProductService

export type ProductServiceWriteBody = {
  name?: string
  imageUrl?: string
  phone?: string
  isActive?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listProductServices() {
  return apiFetch<StoreProductService[]>(endpoints.productServices.list, {
    revalidate: 60,
    tags: ["product-services"],
  })
}

export function listAdminProductServices(token: string) {
  return apiFetch<AdminProductService[]>(endpoints.productServices.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function createProductService(
  token: string,
  body: {
    name: string
    imageUrl: string
    phone?: string
    isActive?: boolean
  },
) {
  return apiFetch<AdminProductService>(endpoints.productServices.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function updateProductService(
  token: string,
  id: string,
  body: ProductServiceWriteBody,
) {
  return apiFetch<AdminProductService>(endpoints.productServices.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export async function uploadProductServiceImage(token: string, file: File) {
  return uploadMediaImage(token, file, "services")
}
