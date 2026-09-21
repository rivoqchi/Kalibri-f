/** Shared public env helpers — prefer these over scattering `process.env`. */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Backend API origin (SSR + Socket.IO). Browser HTTP uses same-origin `/api` rewrite. */
export function getPublicApiUrl(): string {
  return stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8000",
  );
}

/**
 * Socket.IO origin. Defaults to `NEXT_PUBLIC_API_URL`.
 * Set separately when WS is on another host/port than the HTTP API.
 */
export function getPublicWsUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);
  return getPublicApiUrl();
}

/** Public site URL (SEO canonical, Open Graph, sitemap). */
export function getPublicSiteUrl(): string {
  return stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  );
}
