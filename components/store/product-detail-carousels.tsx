import { ProductCarouselRow } from "@/components/store/product-carousel-row"
import { listCategories } from "@/lib/api/categories"
import { listProducts, type StoreProduct } from "@/lib/api/products"

const ROW_LIMIT = 10

export async function ProductDetailCarousels({
  product,
}: {
  product: StoreProduct
}) {
  const categorySlug = product.categorySlug?.trim()

  const [relatedResult, newestResult, categoriesResult] =
    await Promise.allSettled([
      categorySlug
        ? listProducts({
            category: categorySlug,
            limit: ROW_LIMIT,
            sort: "newest",
            excludeId: product.id,
          })
        : Promise.resolve({ items: [] as StoreProduct[] }),
      listProducts({
        limit: ROW_LIMIT,
        sort: "newest",
        excludeId: product.id,
      }),
      categorySlug ? listCategories() : Promise.resolve([]),
    ])

  const related =
    relatedResult.status === "fulfilled" ? relatedResult.value.items : []
  const newest =
    newestResult.status === "fulfilled" ? newestResult.value.items : []

  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : []
  const categoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
    : undefined

  if (related.length === 0 && newest.length === 0) return null

  return (
    <div className="flex min-w-0 flex-col gap-6 border-t border-border/60 pt-6 pb-2 md:gap-8 md:pt-8 md:pb-4">
      <ProductCarouselRow title={categoryName} products={related} />
      <ProductCarouselRow title="Yangi mahsulotlar" products={newest} />
    </div>
  )
}
