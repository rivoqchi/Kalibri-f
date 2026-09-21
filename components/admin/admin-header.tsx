"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { IconShoppingBag } from "@tabler/icons-react"

import { AdminNotificationsBell } from "@/components/admin/admin-notifications-bell"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { getAdminBreadcrumbs } from "@/lib/admin/nav"

export function AdminHeader() {
  const pathname = usePathname()
  const crumbs = getAdminBreadcrumbs(pathname)
  const isMobileMq = useIsMobile()
  const [mqReady, setMqReady] = useState(false)

  useEffect(() => {
    setMqReady(true)
  }, [])

  // Mobile-first until matchMedia is ready (avoids desktop flash on phones)
  const isMobile = mqReady ? isMobileMq : true

  return (
    <header className="flex min-h-14 shrink-0 items-center gap-2 border-b px-3 py-2 md:min-h-16 md:px-4">
      <SidebarTrigger className="size-11 md:size-8" />

      {!isMobile ? (
        <>
          <Separator
            orientation="vertical"
            className="mr-1 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb className="min-w-0 flex-1">
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.title}-${index}`} className="contents">
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {index === crumbs.length - 1 || !crumb.href ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={crumb.href} />}>
                        {crumb.title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      ) : (
        <div className="min-w-0 flex-1" aria-hidden />
      )}

      <div className="ml-auto flex items-center gap-2">
        <AdminNotificationsBell />

        {isMobile ? (
          <Button
            render={<Link href="/" />}
            size="icon"
            className="size-11"
            aria-label="Do'konga qaytish"
          >
            <IconShoppingBag className="size-5" />
          </Button>
        ) : (
          <Button render={<Link href="/" />} className="h-8 px-3">
            Do&apos;konga qaytish
          </Button>
        )}
      </div>
    </header>
  )
}
