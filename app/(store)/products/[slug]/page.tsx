import { Suspense } from "react"
import { notFound } from "next/navigation"

import { ProductDetail } from "@/components/store/product-detail"
import { ProductDetailCarousels } from "@/components/store/product-detail-carousels"
import { ProductDetailSkeleton } from "@/components/store/store-skeletons"
import { ApiError } from "@/lib/api/client"
import { listPartners, type StorePartner } from "@/lib/api/partners"
import { getProductBySlug } from "@/lib/api/products"

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

async function ProductPageContent({ params }: ProductPageProps) {
  const { slug } = await params

  let product
  try {
    product = await getProductBySlug(slug)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }

  if (!product?.id) notFound()

  let partners: StorePartner[] = []
  try {
    partners = await listPartners()
  } catch {
    partners = []
  }

  return (
    <div className="flex min-w-0 flex-col">
      <ProductDetail product={product} partners={partners} />
      <ProductDetailCarousels product={product} />
    </div>
  )
}

export default function ProductPage(props: ProductPageProps) {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductPageContent {...props} />
    </Suspense>
  )
}
