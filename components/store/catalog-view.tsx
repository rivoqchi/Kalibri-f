import { CatalogCategoryList } from "@/components/store/catalog-category-list"
import { ProductCard } from "@/components/store/product-card"
import { listCategories } from "@/lib/api/categories"
import { listProducts } from "@/lib/api/products"

export async function CatalogView({ slug }: { slug?: string }) {
  if (slug) {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      listProducts({ category: slug, limit: 48, sort: "newest" }),
      listCategories(),
    ])

    const products =
      productsResult.status === "fulfilled" ? productsResult.value.items : []
    const categories =
      categoriesResult.status === "fulfilled" ? categoriesResult.value : []
    const category = categories.find((item) => item.slug === slug)

    return (
      <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-4">
        {category ? (
          <h1 className="text-lg font-medium tracking-tight md:text-xl">
            {category.name}
          </h1>
        ) : null}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const categories = await listCategories().catch(() => [])

  return (
    <div className="flex flex-col gap-4 py-3 md:gap-5 md:py-6">
      <h1 className="text-lg font-medium tracking-tight md:text-xl">
        Kataloglar
      </h1>
      <CatalogCategoryList categories={categories} />
    </div>
  )
}
