import { Suspense } from "react"

import { ProductCard } from "@/components/store/product-card"
import { ProductDirectionsStrip } from "@/components/store/product-directions-strip"
import {
  ProductsFilters,
  type ProductsFilterValues,
} from "@/components/store/products-filters"
import { ProductsPagination } from "@/components/store/products-pagination"
import { ProductsSort } from "@/components/store/products-sort"
import type { StoreBrand } from "@/lib/api/brands"
import type { StoreCategory } from "@/lib/api/categories"
import type { StoreProduct } from "@/lib/api/products"

type ProductsListingViewProps = {
  products: StoreProduct[]
  brands: StoreBrand[]
  categories: StoreCategory[]
  priceBounds: { min: number; max: number }
  page: number
  total: number
  limit: number
  values: ProductsFilterValues
}

function categoryHref(slug: string) {
  return `/products?category=${encodeURIComponent(slug)}`
}

export function ProductsListingView({
  products,
  brands,
  categories,
  priceBounds,
  page,
  total,
  limit,
  values,
}: ProductsListingViewProps) {
  const categoryItems = categories.map((category) => ({
    id: category.id,
    name: category.name,
    imageUrl: category.imageUrl,
    href: categoryHref(category.slug),
  }))

  return (
    <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-4">
      {categoryItems.length > 0 ? (
        <Suspense fallback={null}>
          <ProductDirectionsStrip
            items={categoryItems}
            variant="section"
            activeKey={
              values.category ? categoryHref(values.category) : undefined
            }
            className="md:hidden"
          />
        </Suspense>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <ProductsFilters
          brands={brands}
          categories={categories}
          priceBounds={priceBounds}
          values={values}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4">
          <ProductsSort value={values.sort} />

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          <Suspense fallback={null}>
            <ProductsPagination page={page} total={total} limit={limit} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
