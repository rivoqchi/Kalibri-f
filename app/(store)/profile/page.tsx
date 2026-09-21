import { Suspense } from "react"

import { ProfilePageClient } from "@/components/profile/profile-page"
import { listProductServices } from "@/lib/api/product-services"

export default async function ProfilePage() {
  const services = await listProductServices().catch(() => [])

  return (
    <Suspense fallback={null}>
      <ProfilePageClient services={services} />
    </Suspense>
  )
}
