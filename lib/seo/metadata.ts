import type { Metadata } from "next";
import { getPublicSiteUrl } from "@/lib/env";

export const SITE_NAME = "Kalibri Texnika";

export const DEFAULT_DESCRIPTION =
  "Kalibri Texnika — online store for technical equipment and spare parts.";

export function getSiteUrl(): string {
  return getPublicSiteUrl();
}

type BuildMetadataInput = {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImage = image ?? `${siteUrl}/og-default.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "uz_UZ",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Kalibri Texnika",
    "e-commerce",
    "texnika",
    "online store",
    "Uzbekistan",
  ],
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};
