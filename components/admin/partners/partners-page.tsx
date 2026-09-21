"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconCamera,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react"
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
import { authErrorMessage } from "@/lib/api/auth"
import {
  ADMIN_IMAGE_DIMENSIONS,
  imageDimensionLabel,
  validateImageDimensions,
} from "@/lib/admin/image-dimensions"
import {
  createPartner,
  listAdminPartners,
  updatePartner,
  uploadPartnerImage,
  type AdminPartner,
  type PartnerMonth,
} from "@/lib/api/partners"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6
const MONTH_OPTIONS = [3, 6, 9, 12, 15, 18, 24, 36] as const

type MonthDraft = {
  key: string
  month: number | null
  percent: string
}

function monthsEqual(a: PartnerMonth[], b: PartnerMonth[]) {
  if (a.length !== b.length) return false
  return a.every(
    (item, index) =>
      item.month === b[index]?.month && item.percent === b[index]?.percent,
  )
}

function draftToMonths(drafts: MonthDraft[]): PartnerMonth[] | null {
  const months: PartnerMonth[] = []
  for (const draft of drafts) {
    if (draft.month === null) return null
    const raw = draft.percent.trim()
    if (!raw) return null
    const percent = Number(raw)
    if (!Number.isFinite(percent) || percent < 0) return null
    months.push({ month: draft.month, percent })
  }
  return months.sort((a, b) => a.month - b.month)
}

export function PartnersPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminPartner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminPartner | null>(null)
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [monthDrafts, setMonthDrafts] = React.useState<MonthDraft[]>([])
  const [pending, setPending] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminPartners(token)
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

  React.useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q),
    )
  }, [items, query])

  function openCreate() {
    setEditing(null)
    setName("")
    setPhone("")
    setImageUrl("")
    setImageFile(null)
    setImagePreview(null)
    setMonthDrafts([])
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  function openEdit(partner: AdminPartner) {
    setEditing(partner)
    setName(partner.name)
    setPhone(partner.phone)
    setImageUrl(partner.imageUrl)
    setImageFile(null)
    setImagePreview(null)
    setMonthDrafts(
      partner.months.map((item) => ({
        key: `${item.month}-${item.percent}-${Math.random().toString(36).slice(2, 8)}`,
        month: item.month,
        percent: String(item.percent),
      })),
    )
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  function addMonthRow() {
    const used = new Set(
      monthDrafts
        .map((item) => item.month)
        .filter((month): month is number => month !== null),
    )
    const next = MONTH_OPTIONS.find((month) => !used.has(month))
    if (next === undefined) return
    setMonthDrafts((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        month: next,
        percent: "",
      },
    ])
  }

  function updateMonthDraft(
    key: string,
    patch: Partial<Pick<MonthDraft, "month" | "percent">>,
  ) {
    setMonthDrafts((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  }

  function removeMonthDraft(key: string) {
    setMonthDrafts((prev) => prev.filter((item) => item.key !== key))
  }

  async function onToggle(partner: AdminPartner, next: boolean) {
    if (!token || togglingId) return
    setTogglingId(partner.id)
    setItems((prev) =>
      prev.map((item) =>
        item.id === partner.id ? { ...item, isActive: next } : item,
      ),
    )
    try {
      const updated = await updatePartner(token, partner.id, {
        isActive: next,
      })
      setItems((prev) =>
        prev.map((item) => (item.id === partner.id ? updated : item)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === partner.id
            ? { ...item, isActive: partner.isActive }
            : item,
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
    if (!nextName) return

    const nextMonths = draftToMonths(monthDrafts)
    if (nextMonths === null) return

    setPending(true)
    try {
      let nextImageUrl = imageUrl
      if (imageFile) {
        nextImageUrl = await uploadPartnerImage(token, imageFile)
      }
      if (!editing && !nextImageUrl) {
        toast.error("Logo")
        return
      }

      const nextPhone = phone.trim()

      if (editing) {
        const body: {
          name?: string
          imageUrl?: string
          phone?: string
          months?: PartnerMonth[]
        } = {}
        if (nextName !== editing.name) body.name = nextName
        if (nextImageUrl && nextImageUrl !== editing.imageUrl) {
          body.imageUrl = nextImageUrl
        }
        if (nextPhone !== editing.phone) body.phone = nextPhone
        if (!monthsEqual(nextMonths, editing.months)) body.months = nextMonths
        if (Object.keys(body).length === 0) {
          setDialogOpen(false)
          return
        }
        const updated = await updatePartner(token, editing.id, body)
        setItems((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item)),
        )
      } else {
        const created = await createPartner(token, {
          name: nextName,
          imageUrl: nextImageUrl,
          phone: nextPhone,
          months: nextMonths,
        })
        setItems((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
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

  const previewSrc = imagePreview || imageUrl || null
  const availableMonthCount = MONTH_OPTIONS.filter(
    (month) => !monthDrafts.some((draft) => draft.month === month),
  ).length
  const monthsValid = draftToMonths(monthDrafts) !== null

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

      <div className="overflow-x-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead className="w-20">Faol</TableHead>
              <TableHead className="w-28" />
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
                    <TableCell className="hidden sm:table-cell">
                      <Skeleton className="h-4 w-24 max-w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-8 rounded-2xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="size-9 rounded-2xl" />
                    </TableCell>
                  </TableRow>
                ))
              : filtered.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                        {partner.imageUrl ? (
                          <Image
                            src={partner.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[12rem] truncate font-medium md:max-w-none">
                      {partner.name}
                    </TableCell>
                    <TableCell className="hidden max-w-[10rem] truncate sm:table-cell md:max-w-none">
                      {partner.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={partner.isActive}
                        disabled={togglingId === partner.id}
                        onCheckedChange={(checked) =>
                          onToggle(partner, checked)
                        }
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
                        onClick={() => openEdit(partner)}
                      >
                        <IconPencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-lg">
          <form onSubmit={onSave} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Tahrirlash" : "Qo'shish"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="partner-logo">
                  {imageDimensionLabel(
                    "Logo",
                    ADMIN_IMAGE_DIMENSIONS.partners,
                  )}
                </Label>
                <button
                  type="button"
                  className="relative size-24 rounded-full"
                  aria-label="Logo"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-muted">
                    {previewSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewSrc}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-popover">
                    <IconCamera className="size-4" />
                  </span>
                </button>
                <input
                  id="partner-logo"
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const input = event.target
                    const file = input.files?.[0] ?? null
                    input.value = ""
                    if (!file) {
                      setImageFile(null)
                      return
                    }
                    if (!file.type.startsWith("image/")) {
                      toast.error("Logo")
                      setImageFile(null)
                      return
                    }
                    void validateImageDimensions(
                      file,
                      ADMIN_IMAGE_DIMENSIONS.partners,
                    ).then((check) => {
                      if (!check.ok) {
                        toast.error(check.message)
                        setImageFile(null)
                        return
                      }
                      setImageFile(file)
                    })
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="partner-name">Name</Label>
                <Input
                  id="partner-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="partner-phone">Phone</Label>
                <Input
                  id="partner-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-11"
                  inputMode="tel"
                />
              </div>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full sm:w-auto"
                  onClick={addMonthRow}
                  disabled={availableMonthCount === 0}
                >
                  <IconPlus data-icon="inline-start" />
                  oy qo&apos;shish
                </Button>
                {monthDrafts.map((draft) => {
                  const usedByOthers = new Set(
                    monthDrafts
                      .filter((item) => item.key !== draft.key)
                      .map((item) => item.month)
                      .filter((month): month is number => month !== null),
                  )
                  const options = MONTH_OPTIONS.filter(
                    (month) =>
                      month === draft.month || !usedByOthers.has(month),
                  )
                  return (
                    <div
                      key={draft.key}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                      <Select
                        value={
                          draft.month === null ? null : String(draft.month)
                        }
                        onValueChange={(next) => {
                          if (next === null) return
                          updateMonthDraft(draft.key, {
                            month: Number(next),
                          })
                        }}
                      >
                        <SelectTrigger className="h-11 w-full sm:min-w-28 sm:flex-1">
                          <SelectValue>
                            {(selected: string | null) =>
                              selected ? `${selected}` : ""
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                          alignItemWithTrigger={false}
                          align="start"
                        >
                          {options.map((month) => (
                            <SelectItem
                              key={month}
                              value={String(month)}
                              className="min-h-11"
                            >
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Input
                          value={draft.percent}
                          onChange={(event) =>
                            updateMonthDraft(draft.key, {
                              percent: event.target.value,
                            })
                          }
                          className="h-11 min-w-0 flex-1"
                          inputMode="decimal"
                          placeholder="foiz"
                          aria-label="foiz"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11 shrink-0"
                          aria-label="Delete"
                          onClick={() => removeMonthDraft(draft.key)}
                        >
                          <IconTrash />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto"
                disabled={
                  pending ||
                  !name.trim() ||
                  !monthsValid ||
                  (!editing && !imageFile && !imageUrl)
                }
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
