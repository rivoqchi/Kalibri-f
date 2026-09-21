import { Suspense } from "react"

import { ProductsListingView } from "@/components/store/products-listing-view"
import { ProductsListingSkeleton } from "@/components/store/store-skeletons"
import { listBrands } from "@/lib/api/brands"
import { listCategories } from "@/lib/api/categories"
import {
  getProductPriceRange,
  listProducts,
  type ListProductsParams,
} from "@/lib/api/products"

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SORT_VALUES = new Set([
  "price_asc",
  "price_desc",
  "newest",
  "bestseller",
  "relevance",
])

function one(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

function parseNumber(value: string | undefined) {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

async function ProductsPageContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const sortRaw = one(params.sort)?.trim()
  const sort = sortRaw && SORT_VALUES.has(sortRaw)
    ? (sortRaw as ListProductsParams["sort"])
    : undefined
  const brand = one(params.brand)?.trim() || undefined
  const category = one(params.category)?.trim() || undefined
  const direction = one(params.direction)?.trim() || undefined
  const minPrice = parseNumber(one(params.minPrice))
  const maxPrice = parseNumber(one(params.maxPrice))
  const pageRaw = parseNumber(one(params.page)) ?? 1
  const page = Math.max(1, Math.floor(pageRaw))
  const limit = 50

  const [productsResult, brandsResult, categoriesResult, priceRangeResult] =
    await Promise.allSettled([
      listProducts({
        sort,
        brand,
        category,
        direction,
        minPrice,
        maxPrice,
        page,
        limit,
      }),
      listBrands(),
      listCategories(),
      getProductPriceRange(),
    ])

  const productsList =
    productsResult.status === "fulfilled" ? productsResult.value : null
  const products = productsList?.items ?? []
  const total = productsList?.total ?? 0
  const brands = brandsResult.status === "fulfilled" ? brandsResult.value : []
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : []
  const priceBounds =
    priceRangeResult.status === "fulfilled"
      ? priceRangeResult.value
      : { min: 0, max: 0 }

  const bounds =
    priceBounds.max > priceBounds.min
      ? priceBounds
      : { min: 0, max: Math.max(priceBounds.max, 1_000_000) }

  return (
    <ProductsListingView
      products={products}
      brands={brands}
      categories={categories}
      priceBounds={bounds}
      page={productsList?.page ?? page}
      total={total}
      limit={productsList?.limit ?? limit}
      values={{
        sort,
        brand,
        category,
        minPrice,
        maxPrice,
      }}
    />
  )
}

export default function ProductsPage(props: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsListingSkeleton />}>
      <ProductsPageContent {...props} />
    </Suspense>
  )
}
