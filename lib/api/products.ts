import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { uploadMediaImage } from "@/lib/api/media"

export const PRODUCT_STATUS_OPTIONS = [
  { value: "new", label: "Yangi" },
  { value: "very_cheap", label: "Juda arzon narxda" },
  { value: "used", label: "Ishlatilgan" },
  { value: "seasonal", label: "Mavsum aksiyasi" },
] as const

export type ProductStatusTag = (typeof PRODUCT_STATUS_OPTIONS)[number]["value"]

export type Money = { amount: number; currency: string }

export type AdminProduct = {
  id: string
  slug: string
  code: string
  name: string
  description?: string
  price: Money
  salePrice?: Money | null
  imageUrl?: string
  imageUrls: string[]
  categorySlug?: string
  brand?: string
  attributeIds: string[]
  statusTags: string[]
  newExpiresAt?: string | null
  seasonalExpiresAt?: string | null
  isActive: boolean
  inStock: boolean
  soldCount: number
}

export type StoreProductAttribute = {
  id: string
  name: string
  value: string
  unit: string
  slug?: string
}

/** Public storefront product (GET /api/products). */
export type StoreProduct = {
  id: string
  slug: string
  code: string
  name: string
  description?: string
  price: Money
  salePrice?: Money | null
  imageUrl?: string
  imageUrls: string[]
  categorySlug?: string
  brand?: string
  model?: string
  inStock: boolean
  stockQty?: number
  isNewArrival?: boolean
  attributeIds: string[]
  /** Present on GET /api/products/:slug */
  attributes?: StoreProductAttribute[]
  statusTags: string[]
  isActive: boolean
  soldCount: number
}

export type ProductsListResponse = {
  items: StoreProduct[]
  total: number
  page: number
  limit: number
}

export type ListProductsParams = {
  q?: string
  category?: string
  /** Product direction id (admin Maxsulot yo'nalishi / product-directions). */
  direction?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sort?: "price_asc" | "price_desc" | "newest" | "bestseller" | "relevance"
  page?: number
  limit?: number
  inStock?: boolean
  /** Exclude a product id from results (related / newest rows). */
  excludeId?: string
  /** Resolve specific active products by id (favorites). Order preserved. */
  ids?: string[]
}

export type ProductPriceRange = {
  min: number
  max: number
}

export type ProductFormBody = {
  name: string
  code: string
  description?: string
  price: Money
  salePrice?: Money | null
  imageUrl?: string
  imageUrls?: string[]
  categorySlug?: string
  brand?: string
  attributeIds?: string[]
  statusTags?: string[]
  seasonalDays?: number
}

export type ProductUpdateBody = Partial<ProductFormBody> & {
  isActive?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export type ListAdminProductsParams = {
  q?: string
  limit?: number
  ids?: string[]
}

export function listProducts(params?: ListProductsParams) {
  const search = new URLSearchParams()
  const q = params?.q?.trim()
  if (q) search.set("q", q)
  if (params?.category) search.set("category", params.category)
  if (params?.direction) search.set("direction", params.direction)
  if (params?.brand) search.set("brand", params.brand)
  if (params?.minPrice != null) search.set("minPrice", String(params.minPrice))
  if (params?.maxPrice != null) search.set("maxPrice", String(params.maxPrice))
  if (params?.sort) search.set("sort", params.sort)
  if (params?.page != null) search.set("page", String(params.page))
  if (params?.limit != null) search.set("limit", String(params.limit))
  if (params?.inStock !== undefined) {
    search.set("inStock", String(params.inStock))
  }
  if (params?.excludeId) search.set("excludeId", params.excludeId)
  if (params?.ids?.length) search.set("ids", params.ids.join(","))
  const qs = search.toString()
  return apiFetch<ProductsListResponse>(
    `${endpoints.products.list}${qs ? `?${qs}` : ""}`,
    {
      revalidate: params?.ids?.length ? false : 30,
      tags: ["products"],
    },
  )
}

export function getProductPriceRange() {
  return apiFetch<ProductPriceRange>(endpoints.products.priceRange, {
    revalidate: 60,
    tags: ["products"],
  })
}

export function getProductBySlug(slug: string) {
  return apiFetch<StoreProduct>(endpoints.products.bySlug(slug), {
    revalidate: 30,
    tags: ["products", `product:${slug}`],
  })
}

export function listAdminProducts(
  token: string,
  params?: ListAdminProductsParams,
) {
  const search = new URLSearchParams()
  const q = params?.q?.trim()
  if (q) search.set("q", q)
  if (params?.limit != null) search.set("limit", String(params.limit))
  if (params?.ids?.length) search.set("ids", params.ids.join(","))
  const qs = search.toString()
  return apiFetch<AdminProduct[]>(
    `${endpoints.products.admin}${qs ? `?${qs}` : ""}`,
    {
      headers: authHeaders(token),
      revalidate: false,
    },
  )
}

export function createProduct(token: string, body: ProductFormBody) {
  return apiFetch<AdminProduct>(endpoints.products.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function updateProduct(
  token: string,
  id: string,
  body: ProductUpdateBody,
) {
  return apiFetch<AdminProduct>(endpoints.products.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function deleteProduct(token: string, id: string) {
  return apiFetch<{ ok: boolean; id: string }>(endpoints.products.byId(id), {
    method: "DELETE",
    headers: authHeaders(token),
    revalidate: false,
  })
}

export async function uploadProductImage(token: string, file: File) {
  return uploadMediaImage(token, file, "products")
}

/** `100000` → `100 000` */
export function formatSomInput(value: string) {
  const digits = value.replace(/\D/g, "")
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

/** Display helper: `100000` → `100 000` */
export function formatSom(amount: number) {
  if (!Number.isFinite(amount)) return ""
  return formatSomInput(String(Math.round(amount)))
}

export function parseSomInput(value: string) {
  const digits = value.replace(/\s/g, "")
  if (!digits) return NaN
  return Number(digits)
}

export function productStatusLabel(tag: string) {
  return (
    PRODUCT_STATUS_OPTIONS.find((option) => option.value === tag)?.label ?? tag
  )
}
