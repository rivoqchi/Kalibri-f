"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"

import { RequireSuperAdmin } from "@/components/auth/require-super-admin"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

function DismissToastsOnNavigate() {
  const pathname = usePathname()
  useEffect(() => {
    toast.dismiss()
  }, [pathname])
  return null
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireSuperAdmin>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <div className="min-h-0 flex-1 overflow-auto p-3 md:p-6">
            <DismissToastsOnNavigate />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="bottom-center" />
    </RequireSuperAdmin>
  )
}
