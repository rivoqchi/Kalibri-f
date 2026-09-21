import { getSiteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo/metadata";

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    logo: `${siteUrl}/logo.png`,
  };
}

export function websiteJsonLd(): JsonLd {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

type ProductJsonLdInput = {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price?: number;
  currency?: string;
  sku?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
};

export function productJsonLd({
  name,
  slug,
  description,
  image,
  price,
  currency = "UZS",
  sku,
  availability = "InStock",
}: ProductJsonLdInput): JsonLd {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image,
    url: `${siteUrl}/products/${slug}`,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${slug}`,
      priceCurrency: currency,
      price: price ?? 0,
      availability: `https://schema.org/${availability}`,
    },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
