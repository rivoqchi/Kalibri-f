import type { NextConfig } from "next";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
const imageCdnUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL?.trim();
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();

function toRemotePattern(url: string): {
  protocol: "http" | "https";
  hostname: string;
  pathname: string;
} | null {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    if (protocol !== "http" && protocol !== "https") return null;
    return {
      protocol,
      hostname: parsed.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const remotePatterns = [
  toRemotePattern(apiUrl),
  imageCdnUrl ? toRemotePattern(imageCdnUrl) : null,
  r2PublicUrl ? toRemotePattern(r2PublicUrl) : null,
].filter((pattern): pattern is NonNullable<typeof pattern> => pattern !== null);

const apiProxyTarget =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Next 16 blocks cross-origin /_next/* between localhost ↔ 127.0.0.1 / LAN IP
  // which breaks client hydration (search panel never opens).
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "88.88.5.15",
    "*.trycloudflare.com",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://web.telegram.org https://telegram.org https://*.telegram.org",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/:path*.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
