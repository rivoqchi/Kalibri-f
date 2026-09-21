import { getPublicApiUrl } from "@/lib/env";

/** Browser: same-origin /api (Next rewrite → backend). SSR: direct backend URL. */
export const API_URL =
  typeof window !== "undefined" ? "" : getPublicApiUrl();

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** ISR / cache revalidate in seconds. Use false to opt out of caching. */
  revalidate?: number | false;
  tags?: string[];
};

export async function apiFetch<T>(
  path: string,
  { body, revalidate = 60, tags, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next:
      revalidate === false
        ? { revalidate: 0 }
        : {
            revalidate,
            tags,
          },
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      `API ${response.status} for ${path}`,
      response.status,
      data,
    );
  }

  return data as T;
}
