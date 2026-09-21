import { apiFetch } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { uploadMediaImage } from "@/lib/api/media"

export type HomeAd = {
  id: string
  name: string
  imageUrl: string
  link: string
  isActive: boolean
}

export type AdminHomeAd = HomeAd

export type HomeAdWriteBody = {
  name?: string
  imageUrl?: string
  link?: string
  isActive?: boolean
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export function listHomeAds() {
  return apiFetch<HomeAd[]>(endpoints.homeAds.list, {
    revalidate: 30,
    tags: ["home-ads"],
  })
}

export function listAdminHomeAds(token: string) {
  return apiFetch<AdminHomeAd[]>(endpoints.homeAds.admin, {
    headers: authHeaders(token),
    revalidate: false,
  })
}

export function createHomeAd(
  token: string,
  body: { name: string; imageUrl: string; link: string },
) {
  return apiFetch<AdminHomeAd>(endpoints.homeAds.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export function updateHomeAd(
  token: string,
  id: string,
  body: HomeAdWriteBody,
) {
  return apiFetch<AdminHomeAd>(endpoints.homeAds.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  })
}

export async function uploadHomeAdImage(token: string, file: File) {
  return uploadMediaImage(token, file, "ads")
}
