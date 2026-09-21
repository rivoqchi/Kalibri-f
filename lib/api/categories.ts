import { apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { uploadMediaImage } from "@/lib/api/media";

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

export type StoreCategory = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

export type CategoryWriteBody = {
  name?: string;
  imageUrl?: string;
  isActive?: boolean;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function listCategories() {
  return apiFetch<StoreCategory[]>(endpoints.categories.list, {
    revalidate: 60,
    tags: ["categories"],
  });
}

export function listAdminCategories(token: string) {
  return apiFetch<AdminCategory[]>(endpoints.categories.admin, {
    headers: authHeaders(token),
    revalidate: false,
  });
}

export function createCategory(
  token: string,
  body: { name: string; imageUrl: string; isActive?: boolean },
) {
  return apiFetch<AdminCategory>(endpoints.categories.list, {
    method: "POST",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export function updateCategory(
  token: string,
  id: string,
  body: CategoryWriteBody,
) {
  return apiFetch<AdminCategory>(endpoints.categories.byId(id), {
    method: "PATCH",
    headers: authHeaders(token),
    body,
    revalidate: false,
  });
}

export async function uploadCategoryImage(token: string, file: File) {
  return uploadMediaImage(token, file, "categories");
}
