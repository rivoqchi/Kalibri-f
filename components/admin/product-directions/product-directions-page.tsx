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
  createProductDirection,
  listAdminProductDirections,
  updateProductDirection,
  uploadProductDirectionImage,
  type AdminProductDirection,
} from "@/lib/api/product-directions"
import {
  listAdminProducts,
  type AdminProduct,
} from "@/lib/api/products"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6
const PRODUCT_SEARCH_LIMIT = 30
const PRODUCT_SEARCH_DEBOUNCE_MS = 300

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((id, index) => id === sortedB[index])
}

function mergeProducts(
  prev: Map<string, AdminProduct>,
  next: AdminProduct[],
) {
  if (next.length === 0) return prev
  const map = new Map(prev)
  for (const product of next) map.set(product.id, product)
  return map
}

export function ProductDirectionsPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminProductDirection[]>([])
  const [productCache, setProductCache] = React.useState(
    () => new Map<string, AdminProduct>(),
  )
  const [searchResults, setSearchResults] = React.useState<AdminProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminProductDirection | null>(
    null,
  )
  const [name, setName] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [productIds, setProductIds] = React.useState<string[]>([])
  const [productQuery, setProductQuery] = React.useState("")
  const [searchPending, setSearchPending] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const searchRequestId = React.useRef(0)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await listAdminProductDirections(token)
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

  React.useEffect(() => {
    if (!dialogOpen || !token) return
    const q = productQuery.trim()
    if (!q) {
      searchRequestId.current += 1
      setSearchResults([])
      setSearchPending(false)
      return
    }

    const requestId = ++searchRequestId.current
    setSearchPending(true)
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const results = await listAdminProducts(token, {
            q,
            limit: PRODUCT_SEARCH_LIMIT,
          })
          if (searchRequestId.current !== requestId) return
          setSearchResults(results)
          setProductCache((prev) => mergeProducts(prev, results))
        } catch (error) {
          if (searchRequestId.current !== requestId) return
          setSearchResults([])
          toast.error(authErrorMessage(error, "Search"))
        } finally {
          if (searchRequestId.current === requestId) {
            setSearchPending(false)
          }
        }
      })()
    }, PRODUCT_SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [dialogOpen, productQuery, token])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.name.toLowerCase().includes(q))
  }, [items, query])

  const selectedProducts = React.useMemo(
    () =>
      productIds
        .map((id) => productCache.get(id))
        .filter((item): item is AdminProduct => Boolean(item)),
    [productIds, productCache],
  )

  const productOptions = React.useMemo(() => {
    const selected = new Set(productIds)
    return searchResults.filter((product) => !selected.has(product.id))
  }, [searchResults, productIds])

  function resetProductPicker() {
    searchRequestId.current += 1
    setProductQuery("")
    setSearchResults([])
    setSearchPending(false)
  }

  function openCreate() {
    setEditing(null)
    setName("")
    setImageUrl("")
    setImageFile(null)
    setImagePreview(null)
    setProductIds([])
    resetProductPicker()
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  async function openEdit(item: AdminProductDirection) {
    setEditing(item)
    setName(item.name)
    setImageUrl(item.imageUrl)
    setImageFile(null)
    setImagePreview(null)
    setProductIds([...item.productIds])
    resetProductPicker()
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)

    if (!token || item.productIds.length === 0) return
    try {
      const selected = await listAdminProducts(token, {
        ids: item.productIds,
      })
      setProductCache((prev) => mergeProducts(prev, selected))
    } catch (error) {
      toast.error(authErrorMessage(error, "tovarlar"))
    }
  }

  function addProduct(product: AdminProduct) {
    setProductIds((prev) =>
      prev.includes(product.id) ? prev : [...prev, product.id],
    )
    setProductCache((prev) => mergeProducts(prev, [product]))
    setProductQuery("")
    setSearchResults([])
  }

  function removeProduct(id: string) {
    setProductIds((prev) => prev.filter((item) => item !== id))
  }

  async function onToggle(item: AdminProductDirection, next: boolean) {
    if (!token || togglingId) return
    setTogglingId(item.id)
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id ? { ...entry, isActive: next } : entry,
      ),
    )
    try {
      const updated = await updateProductDirection(token, item.id, {
        isActive: next,
      })
      setItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? updated : entry)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, isActive: item.isActive } : entry,
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
        nextImageUrl = await uploadProductDirectionImage(token, imageFile)
      }
      if (!editing && !nextImageUrl) {
        toast.error("rasm")
        return
      }

      if (editing) {
        const body: {
          name?: string
          imageUrl?: string
          productIds?: string[]
        } = {}
        if (nextName !== editing.name) body.name = nextName
        if (nextImageUrl && nextImageUrl !== editing.imageUrl) {
          body.imageUrl = nextImageUrl
        }
        if (!arraysEqual(productIds, editing.productIds)) {
          body.productIds = productIds
        }
        if (Object.keys(body).length === 0) {
          setDialogOpen(false)
          return
        }
        const updated = await updateProductDirection(token, editing.id, body)
        setItems((prev) =>
          prev.map((entry) => (entry.id === editing.id ? updated : entry)),
        )
      } else {
        const created = await createProductDirection(token, {
          name: nextName,
          imageUrl: nextImageUrl,
          productIds,
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
  const showOptionsEmpty =
    !searchPending && productQuery.trim().length > 0 && productOptions.length === 0

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
            <TableHead className="w-14">rasm</TableHead>
            <TableHead>nom</TableHead>
            <TableHead className="hidden sm:table-cell">tovarlar</TableHead>
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
            : filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[12rem] truncate font-medium md:max-w-none">
                    {item.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums">
                    {item.productIds.length}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      disabled={togglingId === item.id}
                      onCheckedChange={(checked) => onToggle(item, checked)}
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
                      onClick={() => void openEdit(item)}
                    >
                      <IconPencil />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

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
                <Label htmlFor="direction-image">
                  {imageDimensionLabel(
                    "rasm",
                    ADMIN_IMAGE_DIMENSIONS.directions,
                  )}
                </Label>
                <button
                  type="button"
                  className="relative size-24 rounded-full"
                  aria-label="rasm"
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
                  id="direction-image"
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
                      toast.error("rasm")
                      setImageFile(null)
                      return
                    }
                    void validateImageDimensions(
                      file,
                      ADMIN_IMAGE_DIMENSIONS.directions,
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
                <Label htmlFor="direction-name">nom</Label>
                <Input
                  id="direction-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="direction-products">tovarlar</Label>
                <div className="relative">
                  <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="direction-products"
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="Search"
                    className="h-11 pl-9"
                    aria-label="Search"
                    autoComplete="off"
                  />
                </div>
                {productQuery.trim() || searchPending ? (
                  <div className="grid max-h-40 gap-1 overflow-y-auto rounded-2xl bg-muted/40 p-2 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {searchPending && productOptions.length === 0 ? (
                      <p className="px-2 py-2 text-sm text-muted-foreground">
                        …
                      </p>
                    ) : showOptionsEmpty ? (
                      <p className="px-2 py-2 text-sm text-muted-foreground">
                        —
                      </p>
                    ) : (
                      productOptions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="flex min-h-11 items-center rounded-xl px-3 text-left text-sm hover:bg-background"
                          onClick={() => addProduct(product)}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {product.name}
                          </span>
                          <IconPlus className="ml-2 size-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
                {selectedProducts.length > 0 ? (
                  <ul className="grid gap-2">
                    {selectedProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex min-h-11 items-center gap-2 rounded-2xl bg-muted/40 px-3"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {product.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-9 shrink-0"
                          aria-label="Delete"
                          onClick={() => removeProduct(product.id)}
                        >
                          <IconTrash />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
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
