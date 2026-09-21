"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconBell } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  listNotifications,
  markNotificationRead,
  type AdminNotification,
} from "@/lib/api/notifications"
import { useAuthStore } from "@/lib/auth/store"
import { getRealtimeSocket } from "@/lib/realtime/socket"
import { cn } from "@/lib/utils"

export function AdminNotificationsBell() {
  const token = useAuthStore((state) => state.token)
  const router = useRouter()
  const [items, setItems] = React.useState<AdminNotification[]>([])
  const [open, setOpen] = React.useState(false)
  const knownIds = React.useRef<Set<string>>(new Set())
  const hydrated = React.useRef(false)

  const load = React.useCallback(async () => {
    if (!token) return
    try {
      const list = await listNotifications(token)
      setItems(list)
      if (!hydrated.current) {
        knownIds.current = new Set(list.map((item) => item.id))
        hydrated.current = true
      }
    } catch {
      // keep previous
    }
  }, [token])

  React.useEffect(() => {
    void load()
    const timer = window.setInterval(() => {
      void load()
    }, 20_000)
    return () => window.clearInterval(timer)
  }, [load])

  React.useEffect(() => {
    const socket = getRealtimeSocket()
    const onCreated = (payload: unknown) => {
      const note = payload as AdminNotification | null
      if (!note?.id || !note.orderId) return
      if (knownIds.current.has(note.id)) return
      knownIds.current.add(note.id)
      setItems((prev) => [note, ...prev.filter((item) => item.id !== note.id)])
      toast.custom(
        (id) => (
          <button
            type="button"
            className="w-full rounded-2xl bg-popover px-4 py-3 text-left text-sm font-medium text-popover-foreground shadow-lg ring-1 ring-foreground/5"
            onClick={() => {
              toast.dismiss(id)
              router.push(`/admin/orders/${note.orderId}`)
            }}
          >
            {note.message || "Yangi buyurtma keldi"}
          </button>
        ),
        { duration: 6000 },
      )
    }
    socket.on("notification:created", onCreated)
    return () => {
      socket.off("notification:created", onCreated)
    }
  }, [router])

  const unread = items.filter((item) => !item.read).length

  async function openNotification(item: AdminNotification) {
    setOpen(false)
    if (token && !item.read) {
      try {
        const next = await markNotificationRead(token, item.id)
        setItems((prev) =>
          prev.map((entry) => (entry.id === item.id ? next : entry)),
        )
      } catch {
        // navigate anyway
      }
    }
    router.push(`/admin/orders/${item.orderId}`)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-11 md:size-8"
            aria-label="notification"
          />
        }
      >
        <IconBell className="size-5" />
        {unread > 0 ? (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive md:top-1.5 md:right-1.5" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-80 w-72 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            —
          </div>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={cn(
                "min-h-11 cursor-pointer items-start gap-2 py-2",
                !item.read && "font-medium",
              )}
              onClick={() => void openNotification(item)}
            >
              <Link
                href={`/admin/orders/${item.orderId}`}
                className="flex flex-1 flex-col gap-0.5"
                onClick={(event) => event.preventDefault()}
              >
                <span className="text-sm">{item.message}</span>
              </Link>
              {!item.read ? (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              ) : null}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
