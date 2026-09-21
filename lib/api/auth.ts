import {
  ADMIN_IMAGE_DIMENSIONS,
  validateImageDimensions,
} from "@/lib/admin/image-dimensions";
import { API_URL, ApiError, apiFetch } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AuthUser } from "@/lib/auth/store";

export type TelegramBotInfo = {
  username: string;
  deepLink: string;
  ready: boolean;
};

export type VerifyTelegramResponse = {
  token: string;
  user: AuthUser;
};

export type UpdateProfileInput = {
  firstName: string;
  lastName: string;
};

export function fetchTelegramBotInfo() {
  return apiFetch<TelegramBotInfo>(endpoints.auth.bot, { revalidate: false });
}

export function verifyTelegramCode(code: string) {
  return apiFetch<VerifyTelegramResponse>(endpoints.auth.verify, {
    method: "POST",
    body: { code },
    revalidate: false,
  });
}

export function verifyTelegramWebApp(initData: string) {
  return apiFetch<VerifyTelegramResponse>(endpoints.auth.webapp, {
    method: "POST",
    body: { initData },
    revalidate: false,
  });
}

export function fetchAuthMe(token: string) {
  return apiFetch<AuthUser>(endpoints.auth.me, {
    headers: { Authorization: `Bearer ${token}` },
    revalidate: false,
  });
}

export function updateAuthMe(token: string, body: UpdateProfileInput) {
  return apiFetch<AuthUser>(endpoints.auth.me, {
    method: "PATCH",
    body,
    headers: { Authorization: `Bearer ${token}` },
    revalidate: false,
  });
}

export async function updateAuthMePhoto(token: string, file: File) {
  const check = await validateImageDimensions(
    file,
    ADMIN_IMAGE_DIMENSIONS.avatars,
  );
  if (!check.ok) {
    throw new ApiError(check.message, 400, { message: check.message });
  }

  const url = `${API_URL}${endpoints.auth.mePhoto}`;
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      `API ${response.status} for ${endpoints.auth.mePhoto}`,
      response.status,
      data,
    );
  }

  return data as AuthUser;
}

export async function fetchAuthMePhoto(token: string): Promise<Blob | null> {
  const url = `${API_URL}${endpoints.auth.mePhoto}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.blob();
}

export function authErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const body = error.body as { message?: string | string[] } | null;
    const message = body?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  return fallback;
}
