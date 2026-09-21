import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { uploadMediaImage } from "@/lib/api/media";

export type StoreBrand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
};

export type AdminBrand = StoreBrand;

export type BrandWriteBody = {
  name?: string;
  imageUrl?: string;
  isActive?: boolean;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function listBrands() {
  return apiFetch<StoreBrand[]>(endpoints.brands.list, {
    revalidate: 60,
    tags: ["brands"],
  });
}

export function listAdminBrands(token: string) {
  return apiFetch<AdminBrand[]>(endpoints.brands.admin, {
    headers: authHeaders(token),
    revalidate: false,
  });
}

export function createBrand(
  token: string,
  body: { name: string; imageUrl: string; isActive?: boolean },
) {
  return apiFetch<AdminBrand>(endpoints.brands.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export function updateBrand(token: string, id: string, body: BrandWriteBody) {
  return apiFetch<AdminBrand>(endpoints.brands.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export async function uploadBrandImage(token: string, file: File) {
  return uploadMediaImage(token, file, "brands");
}
