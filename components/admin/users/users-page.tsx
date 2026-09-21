"use client"

import * as React from "react"
import Image from "next/image"
import { IconSearch } from "@tabler/icons-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authErrorMessage } from "@/lib/api/auth"
import {
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
} from "@/lib/api/users"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6

export function UsersPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminUsers(token)
      setItems(list)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [token])

  React.useEffect(() => {
    void load()
  }, [load])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const haystack = [
        item.fullName,
        item.firstName,
        item.lastName,
        item.phone ?? "",
        item.username ?? "",
        item.role,
        String(item.telegramId),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [items, query])

  async function onToggle(user: AdminUser, nextActive: boolean) {
    if (!token || togglingId) return
    const nextBlocked = !nextActive
    setTogglingId(user.id)
    setItems((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, isBlocked: nextBlocked } : item,
      ),
    )
    try {
      const updated = await updateAdminUser(token, user.id, {
        isBlocked: nextBlocked,
      })
      setItems((prev) =>
        prev.map((item) => (item.id === user.id ? updated : item)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, isBlocked: user.isBlocked } : item,
        ),
      )
      toast.error(authErrorMessage(error, "Faol"))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="h-11 pl-9"
            aria-label="Search"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14"> </TableHead>
            <TableHead>Ism</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead className="w-20">Faol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`sk-${index}`}>
                  <TableCell>
                    <Skeleton className="size-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 max-w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 max-w-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8 rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            : filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      {user.photoUrl ? (
                        <Image
                          src={user.photoUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate font-medium md:max-w-none">
                    <span className="block truncate">{user.fullName}</span>
                    {user.username ? (
                      <span className="block truncate text-xs text-muted-foreground">
                        @{user.username}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[9rem] truncate md:max-w-none">
                    {user.phone ?? ""}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.role}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={!user.isBlocked}
                      disabled={togglingId === user.id}
                      onCheckedChange={(checked) => onToggle(user, checked)}
                      aria-label="Faol"
                    />
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
