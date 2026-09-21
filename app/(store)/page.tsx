import { Suspense } from "react"

import { HomeBannerCarousel } from "@/components/store/home-banner-carousel"
import { HomeProductsSection } from "@/components/store/home-products-section"
import { ProductDirectionsStrip } from "@/components/store/product-directions-strip"
import { HomePageSkeleton } from "@/components/store/store-skeletons"
import { listCategories, type StoreCategory } from "@/lib/api/categories"
import { listHomeAds } from "@/lib/api/home-ads"
import { listProductDirections } from "@/lib/api/product-directions"
import { listProducts, type StoreProduct } from "@/lib/api/products"

const HOME_PRODUCTS_LIMIT = 8
const CATEGORY_PRODUCTS_LIMIT = 10

type CategoryProductsSection = {
  category: StoreCategory
  products: StoreProduct[]
}

async function HomePageContent() {
  const [adsResult, productsResult, directionsResult, categoriesResult] =
    await Promise.allSettled([
      listHomeAds(),
      listProducts({ limit: HOME_PRODUCTS_LIMIT, sort: "newest" }),
      listProductDirections(),
      listCategories(),
    ])

  const ads = adsResult.status === "fulfilled" ? adsResult.value : []
  const products =
    productsResult.status === "fulfilled" ? productsResult.value.items : []
  const directions =
    directionsResult.status === "fulfilled" ? directionsResult.value : []
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : []

  const categorySectionResults = await Promise.allSettled(
    categories.map(async (category) => {
      const { items } = await listProducts({
        category: category.slug,
        limit: CATEGORY_PRODUCTS_LIMIT,
        sort: "newest",
      })
      return { category, products: items } satisfies CategoryProductsSection
    }),
  )

  const categorySections = categorySectionResults
    .filter(
      (result): result is PromiseFulfilledResult<CategoryProductsSection> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .filter((section) => section.products.length > 0)

  if (
    ads.length === 0 &&
    products.length === 0 &&
    directions.length === 0 &&
    categorySections.length === 0
  ) {
    return null
  }

  const directionItems = directions.map((direction) => ({
    id: direction.id,
    name: direction.name,
    imageUrl: direction.imageUrl,
    href: `/products?direction=${encodeURIComponent(direction.id)}`,
  }))

  return (
    <div className="flex min-w-0 flex-col gap-6 py-3 md:gap-8 md:py-4">
      {ads.length > 0 ? <HomeBannerCarousel ads={ads} /> : null}
      {directionItems.length > 0 ? (
        <ProductDirectionsStrip items={directionItems} variant="section" />
      ) : null}
      <HomeProductsSection products={products} />
      {categorySections.map(({ category, products: categoryProducts }) => (
        <HomeProductsSection
          key={category.id}
          title={category.name}
          products={categoryProducts}
          seeAllHref={`/products?category=${encodeURIComponent(category.slug)}`}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}
