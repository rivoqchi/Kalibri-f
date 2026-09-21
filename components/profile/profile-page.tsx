"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { RequireAuth } from "@/components/auth/require-auth"
import { ProfileMe } from "@/components/profile/profile-me"
import {
  ProfileNav,
  PROFILE_SECTIONS,
  type ProfileSectionId,
} from "@/components/profile/profile-nav"
import { ProfileOrders } from "@/components/profile/profile-orders"
import { ProfileServices } from "@/components/profile/profile-services"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { ApiError } from "@/lib/api/client"
import { fetchAuthMe } from "@/lib/api/auth"
import type { StoreProductService } from "@/lib/api/product-services"
import { useAuthStore } from "@/lib/auth/store"

function isProfileSection(value: string | null): value is ProfileSectionId {
  return PROFILE_SECTIONS.some((item) => item.id === value)
}

export function ProfilePageClient({
  services,
}: {
  services: StoreProductService[]
}) {
  return (
    <RequireAuth>
      <ProfileView services={services} />
    </RequireAuth>
  )
}

function ProfileView({ services }: { services: StoreProductService[] }) {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get("section")
  const [section, setSection] = React.useState<ProfileSectionId>(
    isProfileSection(sectionParam) ? sectionParam : "me",
  )

  React.useEffect(() => {
    if (isProfileSection(sectionParam)) {
      setSection(sectionParam)
    }
  }, [sectionParam])

  React.useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchAuthMe(token)
      .then((nextUser) => {
        if (!cancelled) setSession(token, nextUser)
      })
      .catch((error) => {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 401) {
          clearSession()
        }
      })
    return () => {
      cancelled = true
    }
  }, [token, setSession, clearSession])

  if (!token || !user) return null

  return (
    <div className="flex flex-col gap-4 py-4 md:flex-row md:items-start md:gap-8 md:py-8">
      <ProfileNav section={section} onSectionChange={setSection} />
      <div className="min-w-0 flex-1">
        {section === "me" ? (
          <div className="flex flex-col gap-8">
            <ProfileMe
              user={user}
              token={token}
              onUser={(nextUser) => setSession(token, nextUser)}
            />
            <ProfileServices services={services} />
          </div>
        ) : null}
        {section === "orders" ? <ProfileOrders token={token} /> : null}
        {section === "settings" ? <ProfileSettings /> : null}
      </div>
    </div>
  )
}
