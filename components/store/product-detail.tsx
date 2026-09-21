"use client"

import { ProductCartControls } from "@/components/store/product-cart-controls"
import { ProductGallery } from "@/components/store/product-gallery"
import { ProductInstallment } from "@/components/store/product-installment"
import { useRecordRecentProduct } from "@/hooks/use-record-recent-product"
import type { StorePartner } from "@/lib/api/partners"
import {
  formatSom,
  productStatusLabel,
  type StoreProduct,
} from "@/lib/api/products"

function galleryImages(product: StoreProduct) {
  const urls = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []
  return [...new Set(urls.filter(Boolean))]
}

function formatAttributeValue(value: string, unit?: string) {
  const trimmedUnit = unit?.trim()
  if (!trimmedUnit) return value
  return `${value} ${trimmedUnit}`
}

export function ProductDetail({
  product,
  partners = [],
}: {
  product: StoreProduct
  partners?: StorePartner[]
}) {
  useRecordRecentProduct(product.id)
  const images = galleryImages(product)
  const saleAmount = product.salePrice?.amount
  const hasSale =
    saleAmount != null &&
    Number.isFinite(saleAmount) &&
    saleAmount < product.price.amount
  const unitPrice = hasSale
    ? { amount: saleAmount, currency: product.salePrice!.currency }
    : product.price
  const installmentPrice = unitPrice.amount
  const attributes = product.attributes ?? []

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 py-3 md:gap-8 md:py-5 lg:grid-cols-2 lg:items-start lg:gap-x-6 lg:gap-y-8 xl:gap-x-8">
      <div className="min-w-0 w-full lg:col-start-1 lg:row-start-1">
        <ProductGallery
          productId={product.id}
          name={product.name}
          images={images}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4 md:gap-5 lg:col-start-2 lg:row-start-1">
        <div className="flex flex-col gap-2">
          {product.brand ? (
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
              {product.brand}
            </p>
          ) : null}

          <h1 className="text-xl leading-snug font-semibold tracking-tight text-foreground sm:text-2xl">
            {product.name}
          </h1>

          {product.code ? (
            <p className="text-sm text-muted-foreground">{product.code}</p>
          ) : null}
        </div>

        {product.statusTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {product.statusTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {productStatusLabel(tag)}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {hasSale ? (
            <>
              <span className="text-2xl font-semibold tracking-tight text-primary">
                {formatSom(saleAmount)}
              </span>
              <span className="text-base text-muted-foreground line-through">
                {formatSom(product.price.amount)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              {formatSom(product.price.amount)}
            </span>
          )}
        </div>

        <ProductCartControls
          productId={product.id}
          slug={product.slug}
          name={product.name}
          unitPrice={unitPrice}
          imageUrl={images[0]}
          inStock={product.inStock}
          variant="detail"
        />

        <ProductInstallment
          priceAmount={installmentPrice}
          partners={partners}
        />

        {attributes.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {attributes.map((attr) => (
              <li
                key={attr.id}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 text-sm"
              >
                <span className="text-muted-foreground">{attr.name}</span>
                <span className="text-right font-medium text-foreground sm:text-left">
                  {formatAttributeValue(attr.value, attr.unit)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {product.description ? (
        <div className="min-w-0 lg:col-span-2 lg:col-start-1">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-[15px]">
            {product.description}
          </p>
        </div>
      ) : null}
    </div>
  )
}
