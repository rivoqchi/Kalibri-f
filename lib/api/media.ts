import {
  ADMIN_IMAGE_DIMENSIONS,
  validateImageDimensions,
} from "@/lib/admin/image-dimensions";
import { API_URL, ApiError } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/**
 * Upload image via backend → R2 (same-origin; no browser→R2 CORS).
 */
export async function uploadMediaImage(
  token: string,
  file: File,
  folder: "products" | "categories" | "brands" | "partners" | "services" | "directions" | "ads",
): Promise<string> {
  const check = await validateImageDimensions(
    file,
    ADMIN_IMAGE_DIMENSIONS[folder],
  );
  if (!check.ok) {
    throw new ApiError(check.message, 400, { message: check.message });
  }

  const path = `${endpoints.media.upload}?${new URLSearchParams({ folder }).toString()}`;
  const url = path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const form = new FormData();
  form.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const text = await response.text();
  let data: { publicUrl?: string } | null = null;
  try {
    data = text ? (JSON.parse(text) as { publicUrl?: string }) : null;
  } catch {
    data = null;
  }

  if (!response.ok || !data?.publicUrl) {
    throw new ApiError(`Upload ${response.status}`, response.status, data);
  }

  return data.publicUrl;
}
