import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { searchIdentityHeaders } from "@/lib/session-id"

export type ApiFavorites = {
  userId?: string
  sessionId?: string
  productIds: string[]
}

function favoritesHeaders(token?: string | null): HeadersInit {
  return searchIdentityHeaders(token)
}

export function getFavorites(token?: string | null) {
  return apiFetch<ApiFavorites>(endpoints.favorites.get, {
    headers: favoritesHeaders(token),
    revalidate: false,
  })
}

export function addFavoriteItem(
  token: string | null | undefined,
  productId: string,
) {
  return apiFetch<ApiFavorites>(endpoints.favorites.addItem, {
    method: "POST",
    headers: favoritesHeaders(token),
    body: { productId },
    revalidate: false,
  })
}

export function removeFavoriteItem(
  token: string | null | undefined,
  productId: string,
) {
  return apiFetch<ApiFavorites>(endpoints.favorites.item(productId), {
    method: "DELETE",
    headers: favoritesHeaders(token),
    revalidate: false,
  })
}

export function replaceFavorites(
  token: string | null | undefined,
  productIds: string[],
) {
  return apiFetch<ApiFavorites>(endpoints.favorites.get, {
    method: "PUT",
    headers: favoritesHeaders(token),
    body: { productIds },
    revalidate: false,
  })
}
