"use client"

import * as React from "react"
import { IconPencil, IconPlus, IconSearch } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  ATTRIBUTE_UNITS,
  attributeUnitLabel,
  type AttributeUnit,
} from "@/lib/admin/attribute-units"
import { authErrorMessage } from "@/lib/api/auth"
import {
  createAttribute,
  listAdminAttributes,
  updateAttribute,
  type AdminAttribute,
} from "@/lib/api/attributes"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6

export function AttributesPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminAttribute[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminAttribute | null>(null)
  const [name, setName] = React.useState("")
  const [value, setValue] = React.useState("")
  const [unit, setUnit] = React.useState<AttributeUnit>("")
  const [pending, setPending] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminAttributes(token)
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
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        attributeUnitLabel(item.unit).toLowerCase().includes(q),
    )
  }, [items, query])

  function openCreate() {
    setEditing(null)
    setName("")
    setValue("")
    setUnit("")
    setDialogOpen(true)
  }

  function openEdit(attr: AdminAttribute) {
    setEditing(attr)
    setName(attr.name)
    setValue(attr.value)
    setUnit(
      (ATTRIBUTE_UNITS.includes(attr.unit as AttributeUnit)
        ? attr.unit
        : "") as AttributeUnit,
    )
    setDialogOpen(true)
  }

  async function onToggle(attr: AdminAttribute, next: boolean) {
    if (!token || togglingId) return
    setTogglingId(attr.id)
    setItems((prev) =>
      prev.map((item) =>
        item.id === attr.id ? { ...item, isActive: next } : item,
      ),
    )
    try {
      const updated = await updateAttribute(token, attr.id, { isActive: next })
      setItems((prev) =>
        prev.map((item) => (item.id === attr.id ? updated : item)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === attr.id ? { ...item, isActive: attr.isActive } : item,
        ),
      )
      toast.error(authErrorMessage(error, "Faol"))
    } finally {
      setTogglingId(null)
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    if (!token || pending) return
    const nextName = name.trim()
    const nextValue = value.trim()
    if (!nextName || !nextValue) return

    setPending(true)
    try {
      if (editing) {
        const body: {
          name?: string
          value?: string
          unit?: string
        } = {}
        if (nextName !== editing.name) body.name = nextName
        if (nextValue !== editing.value) body.value = nextValue
        if (unit !== editing.unit) body.unit = unit
        if (Object.keys(body).length === 0) {
          setDialogOpen(false)
          return
        }
        const updated = await updateAttribute(token, editing.id, body)
        setItems((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item)),
        )
      } else {
        const created = await createAttribute(token, {
          name: nextName,
          value: nextValue,
          unit,
        })
        setItems((prev) =>
          [...prev, created].sort((a, b) =>
            a.name.localeCompare(b.name) || a.value.localeCompare(b.value),
          ),
        )
      }
      setDialogOpen(false)
      toast.success("Saqlash")
    } catch (error) {
      toast.error(authErrorMessage(error, "Saqlash"))
    } finally {
      setPending(false)
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
        <Button
          type="button"
          className="h-11 w-full sm:w-auto"
          onClick={openCreate}
        >
          <IconPlus data-icon="inline-start" />
          Qo&apos;shish
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xususiyat nomi</TableHead>
            <TableHead>Qiymati</TableHead>
            <TableHead className="w-24">Birlik</TableHead>
            <TableHead className="w-20">Faol</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`sk-${index}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-28 max-w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 max-w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8 rounded-2xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-9 rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            : filtered.map((attr) => (
                <TableRow key={attr.id}>
                  <TableCell className="max-w-[10rem] truncate font-medium md:max-w-none">
                    {attr.name}
                  </TableCell>
                  <TableCell className="max-w-[8rem] truncate md:max-w-none">
                    {attr.value}
                  </TableCell>
                  <TableCell>{attributeUnitLabel(attr.unit)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={attr.isActive}
                      disabled={togglingId === attr.id}
                      onCheckedChange={(checked) => onToggle(attr, checked)}
                      aria-label="Faol"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-11 sm:size-9"
                      aria-label="Tahrirlash"
                      onClick={() => openEdit(attr)}
                    >
                      <IconPencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={onSave} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Tahrirlash" : "Qo'shish"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="attr-name">Xususiyat nomi</Label>
                <Input
                  id="attr-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="attr-value">Qiymati</Label>
                <Input
                  id="attr-value"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="attr-unit">Birlik</Label>
                <Select
                  value={unit}
                  onValueChange={(next) => {
                    if (next === null) return
                    setUnit(next as AttributeUnit)
                  }}
                >
                  <SelectTrigger
                    id="attr-unit"
                    className="h-11 w-full"
                  >
                    <SelectValue>
                      {(selected: string | null) =>
                        attributeUnitLabel(selected ?? "")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    {ATTRIBUTE_UNITS.map((item) => (
                      <SelectItem
                        key={item || "none"}
                        value={item}
                        className="min-h-11"
                      >
                        {attributeUnitLabel(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto"
                disabled={pending || !name.trim() || !value.trim()}
              >
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
