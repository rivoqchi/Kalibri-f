"use client"

import * as React from "react"
import Image from "next/image"
import { IconCamera, IconPencil, IconPlus, IconSearch } from "@tabler/icons-react"
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
  createCategory,
  listAdminCategories,
  updateCategory,
  uploadCategoryImage,
  type AdminCategory,
} from "@/lib/api/categories"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6

export function CategoriesPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminCategory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminCategory | null>(null)
  const [name, setName] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminCategories(token)
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
        item.slug.toLowerCase().includes(q),
    )
  }, [items, query])

  function openCreate() {
    setEditing(null)
    setName("")
    setImageUrl("")
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  function openEdit(category: AdminCategory) {
    setEditing(category)
    setName(category.name)
    setImageUrl(category.imageUrl ?? "")
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  async function onToggle(category: AdminCategory, next: boolean) {
    if (!token || togglingId) return
    setTogglingId(category.id)
    setItems((prev) =>
      prev.map((item) =>
        item.id === category.id ? { ...item, isActive: next } : item,
      ),
    )
    try {
      const updated = await updateCategory(token, category.id, {
        isActive: next,
      })
      setItems((prev) =>
        prev.map((item) => (item.id === category.id ? updated : item)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === category.id
            ? { ...item, isActive: category.isActive }
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

    setPending(true)
    try {
      let nextImageUrl = imageUrl
      if (imageFile) {
        nextImageUrl = await uploadCategoryImage(token, imageFile)
      }
      if (!editing && !nextImageUrl) {
        toast.error("Rasm")
        return
      }

      if (editing) {
        const body: { name?: string; imageUrl?: string } = {}
        if (nextName !== editing.name) body.name = nextName
        if (nextImageUrl && nextImageUrl !== (editing.imageUrl ?? "")) {
          body.imageUrl = nextImageUrl
        }
        if (Object.keys(body).length === 0) {
          setDialogOpen(false)
          return
        }
        const updated = await updateCategory(token, editing.id, body)
        setItems((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item)),
        )
      } else {
        const created = await createCategory(token, {
          name: nextName,
          imageUrl: nextImageUrl,
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
            <TableHead className="w-14">Rasm</TableHead>
            <TableHead>Kategoriya nomi</TableHead>
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
                  <TableCell>
                    <Skeleton className="h-5 w-8 rounded-2xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-9 rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            : filtered.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate font-medium md:max-w-none">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={category.isActive}
                      disabled={togglingId === category.id}
                      onCheckedChange={(checked) =>
                        onToggle(category, checked)
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
                      onClick={() => openEdit(category)}
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
                <Label htmlFor="category-image">
                  {imageDimensionLabel(
                    "Rasm",
                    ADMIN_IMAGE_DIMENSIONS.categories,
                  )}
                </Label>
                <button
                  type="button"
                  className="relative size-24 rounded-full"
                  aria-label="Rasm"
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
                  id="category-image"
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
                      toast.error("Rasm")
                      setImageFile(null)
                      return
                    }
                    void validateImageDimensions(
                      file,
                      ADMIN_IMAGE_DIMENSIONS.categories,
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
                <Label htmlFor="category-name">Kategoriya nomi</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto"
                disabled={
                  pending ||
                  !name.trim() ||
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
