"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthPhoto } from "@/hooks/use-auth-photo"
import { useAuthStore, type AuthUser } from "@/lib/auth/store"
import { STORE_LOGO_SRC } from "@/lib/store-config"

import { AdminNavMain } from "@/components/admin/admin-nav-main"

function initials(user: AuthUser) {
  const letters = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim()
  return (letters || user.firstName.charAt(0) || "?").toUpperCase()
}

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const photoSrc = useAuthPhoto(user?.photoUrl, token, user?.photoRevision)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/admin" />}
              tooltip="Admin panel"
            >
              <Image
                src={STORE_LOGO_SRC}
                alt=""
                width={32}
                height={32}
                className="size-8 object-contain"
              />
              <span className="truncate font-medium">Admin panel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain />
      </SidebarContent>
      {user ? (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={user.fullName}
                render={<Link href="/profile" />}
              >
                <Avatar className="size-8">
                  {photoSrc ? <AvatarImage src={photoSrc} alt="" /> : null}
                  <AvatarFallback>{initials(user)}</AvatarFallback>
                </Avatar>
                <span className="truncate">{user.fullName}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : null}
      <SidebarRail />
    </Sidebar>
  )
}
