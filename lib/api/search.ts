import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import type { StoreProduct } from "@/lib/api/products"
import { searchIdentityHeaders } from "@/lib/session-id"

export type SearchProductsResponse = {
  items: StoreProduct[]
  total: number
  page: number
  limit: number
  query: string
  correctedQuery: string | null
  wasCorrected: boolean
}

export type SearchSuggestResponse = {
  suggestions: string[]
  correctedQuery: string | null
}

export type SearchHistoryItem = {
  query: string
  correctedQuery: string | null
  searchedAt: string
}

export type SearchHistoryResponse = {
  items: SearchHistoryItem[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export type SearchRecentProductsResponse = {
  items: StoreProduct[]
  limit: number
}

export function searchProducts(params: {
  q: string
  page?: number
  limit?: number
}) {
  const search = new URLSearchParams()
  const q = params.q.trim()
  if (q) search.set("q", q)
  if (params.page != null) search.set("page", String(params.page))
  if (params.limit != null) search.set("limit", String(params.limit))
  const qs = search.toString()
  return apiFetch<SearchProductsResponse>(
    `${endpoints.search.products}${qs ? `?${qs}` : ""}`,
    { revalidate: false },
  )
}

export function searchSuggest(params: { q: string; limit?: number }) {
  const search = new URLSearchParams()
  const q = params.q.trim()
  if (q) search.set("q", q)
  if (params.limit != null) search.set("limit", String(params.limit))
  const qs = search.toString()
  return apiFetch<SearchSuggestResponse>(
    `${endpoints.search.suggest}${qs ? `?${qs}` : ""}`,
    { revalidate: false },
  )
}

export function listSearchHistory(
  token: string | null | undefined,
  params?: { limit?: number; offset?: number },
) {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set("limit", String(params.limit))
  if (params?.offset != null) search.set("offset", String(params.offset))
  const qs = search.toString()
  return apiFetch<SearchHistoryResponse>(
    `${endpoints.search.history}${qs ? `?${qs}` : ""}`,
    {
      headers: searchIdentityHeaders(token),
      revalidate: false,
    },
  )
}

export function recordSearchHistory(
  token: string | null | undefined,
  body: { query: string; correctedQuery?: string | null },
) {
  return apiFetch<{ ok: boolean }>(endpoints.search.history, {
    method: "POST",
    headers: searchIdentityHeaders(token),
    body: {
      query: body.query,
      ...(body.correctedQuery
        ? { correctedQuery: body.correctedQuery }
        : {}),
    },
    revalidate: false,
  })
}

export function deleteSearchHistory(
  token: string | null | undefined,
  query: string,
) {
  const search = new URLSearchParams()
  search.set("q", query.trim())
  return apiFetch<{ ok: boolean }>(
    `${endpoints.search.history}?${search.toString()}`,
    {
      method: "DELETE",
      headers: searchIdentityHeaders(token),
      revalidate: false,
    },
  )
}

export function listSearchRecentProducts(
  token: string | null | undefined,
  params?: { limit?: number },
) {
  const search = new URLSearchParams()
  if (params?.limit != null) search.set("limit", String(params.limit))
  const qs = search.toString()
  return apiFetch<SearchRecentProductsResponse>(
    `${endpoints.search.recentProducts}${qs ? `?${qs}` : ""}`,
    {
      headers: searchIdentityHeaders(token),
      revalidate: false,
    },
  )
}

export function recordSearchRecentProduct(
  token: string | null | undefined,
  productId: string,
) {
  return apiFetch<{ ok: boolean }>(endpoints.search.recentProducts, {
    method: "POST",
    headers: searchIdentityHeaders(token),
    body: { productId },
    revalidate: false,
  })
}
