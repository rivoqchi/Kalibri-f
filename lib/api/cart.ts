import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { searchIdentityHeaders } from "@/lib/session-id"
import type { CartItem, Money } from "@/types/commerce"

export type ApiCart = {
  userId?: string
  sessionId?: string
  items: CartItem[]
  subtotal: Money
}

function cartHeaders(token?: string | null): HeadersInit {
  return searchIdentityHeaders(token)
}

export function getCart(token?: string | null) {
  return apiFetch<ApiCart>(endpoints.cart.get, {
    headers: cartHeaders(token),
    revalidate: false,
  })
}

export function addCartItem(
  token: string | null | undefined,
  body: { productId: string; quantity?: number },
) {
  return apiFetch<ApiCart>(endpoints.cart.addItem, {
    method: "POST",
    headers: cartHeaders(token),
    body,
    revalidate: false,
  })
}

export function setCartItemQuantity(
  token: string | null | undefined,
  productId: string,
  quantity: number,
) {
  return apiFetch<ApiCart>(endpoints.cart.item(productId), {
    method: "PATCH",
    headers: cartHeaders(token),
    body: { quantity },
    revalidate: false,
  })
}

export function removeCartItem(
  token: string | null | undefined,
  productId: string,
) {
  return apiFetch<ApiCart>(endpoints.cart.item(productId), {
    method: "DELETE",
    headers: cartHeaders(token),
    revalidate: false,
  })
}

export function clearCartApi(token?: string | null) {
  return apiFetch<ApiCart>(endpoints.cart.get, {
    method: "DELETE",
    headers: cartHeaders(token),
    revalidate: false,
  })
}
