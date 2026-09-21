import { Suspense } from "react"

import { CatalogView } from "@/components/store/catalog-view"
import {
  CatalogPageSkeleton,
  CatalogProductsSkeleton,
} from "@/components/store/store-skeletons"

type CatalogPageProps = {
  searchParams: Promise<{ slug?: string | string[] }>
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const raw = params.slug
  const slug = (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined

  return (
    <Suspense
      fallback={
        slug ? <CatalogProductsSkeleton /> : <CatalogPageSkeleton />
      }
    >
      <CatalogView slug={slug} />
    </Suspense>
  )
}
