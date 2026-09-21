"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconChevronRight } from "@tabler/icons-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ADMIN_NAV,
  isAdminHrefActive,
  type AdminNavItem,
} from "@/lib/admin/nav"

export function AdminNavMain() {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  function closeMobile() {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {ADMIN_NAV.map((item) =>
          item.items?.length ? (
            <AdminNavGroup
              key={item.title}
              item={item}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          ) : (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={isAdminHrefActive(item.href, pathname)}
                className="min-h-11 md:min-h-8"
                render={<Link href={item.href} />}
                onClick={closeMobile}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function AdminNavGroup({
  item,
  pathname,
  onNavigate,
}: {
  item: AdminNavItem
  pathname: string
  onNavigate: () => void
}) {
  const childActive = Boolean(
    item.items?.some((child) => isAdminHrefActive(child.href, pathname)),
  )
  const [open, setOpen] = React.useState(childActive)
  const Icon = item.icon

  React.useEffect(() => {
    if (childActive) setOpen(true)
  }, [childActive])

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            tooltip={item.title}
            isActive={childActive}
            className="min-h-11 md:min-h-8"
          />
        }
      >
        <Icon />
        <span>{item.title}</span>
        <IconChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items?.map((child) => (
            <SidebarMenuSubItem key={child.href + child.title}>
              <SidebarMenuSubButton
                isActive={isAdminHrefActive(child.href, pathname)}
                className="min-h-11 md:min-h-7"
                render={<Link href={child.href} />}
                onClick={onNavigate}
              >
                <span>{child.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
