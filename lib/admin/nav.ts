import type { ComponentType } from "react"
import {
  IconAd,
  IconClipboardList,
  IconHome,
  IconLayoutDashboard,
  IconPackage,
  IconRobot,
  IconSend,
  IconUsers,
} from "@tabler/icons-react"

export type AdminNavChild = {
  title: string
  href: string
}

export type AdminNavItem = {
  title: string
  href: string
  icon: ComponentType<{ className?: string }>
  items?: AdminNavChild[]
}

export const ADMIN_NAV: AdminNavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: IconLayoutDashboard,
  },
  {
    title: "Buyurtmalar",
    href: "/admin/orders",
    icon: IconClipboardList,
  },
  {
    title: "Maxsulotlar",
    href: "/admin/products",
    icon: IconPackage,
    items: [
      { title: "Maxsulot yo'nalishi", href: "/admin/products/names" },
      { title: "Xususiyatlari", href: "/admin/products/attributes" },
      { title: "Brend", href: "/admin/products/brands" },
      { title: "Kategoriya", href: "/admin/products/categories" },
      { title: "Hamkorlar", href: "/admin/products/partners" },
      { title: "Maxsulot servisi", href: "/admin/products/services" },
      { title: "Maxsulotlar", href: "/admin/products" },
    ],
  },
  {
    title: "Foydalanuvchilar",
    href: "/admin/users",
    icon: IconUsers,
  },
  {
    title: "Reklamalar",
    href: "/admin/ads",
    icon: IconAd,
  },
  {
    title: "Bosh sahifa reklamalari",
    href: "/admin/ads/home",
    icon: IconHome,
  },
  {
    title: "bot reklamalari",
    href: "/admin/ads/bot",
    icon: IconRobot,
  },
  {
    title: "botdan habar yuborish",
    href: "/admin/bot/message",
    icon: IconSend,
  },
]

export type AdminCrumb = {
  title: string
  href?: string
}

export function isAdminHrefActive(href: string, pathname: string) {
  if (href === "/admin/orders") {
    return pathname === href || pathname.startsWith("/admin/orders/")
  }
  return pathname === href
}

export function getAdminBreadcrumbs(pathname: string): AdminCrumb[] {
  const root: AdminCrumb = { title: "Admin panel", href: "/admin" }
  if (pathname === "/admin") {
    return [root, { title: "Dashboard" }]
  }

  if (pathname === "/admin/orders") {
    return [root, { title: "Buyurtmalar" }]
  }

  if (pathname.startsWith("/admin/orders/")) {
    return [
      root,
      { title: "Buyurtmalar", href: "/admin/orders" },
      { title: "Buyurtma" },
    ]
  }

  for (const item of ADMIN_NAV) {
    if (item.items) {
      const child = item.items.find((entry) => entry.href === pathname)
      if (child) {
        if (child.title === item.title) {
          return [root, { title: child.title }]
        }
        return [
          root,
          { title: item.title, href: item.href },
          { title: child.title },
        ]
      }
    }
    if (item.href === pathname) {
      return [root, { title: item.title }]
    }
  }

  return [root]
}
