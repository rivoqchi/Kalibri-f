"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconCamera,
  IconPencil,
  IconPlus,
  IconSearch,
  IconX,
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
import { Textarea } from "@/components/ui/textarea"
import { attributeUnitLabel } from "@/lib/admin/attribute-units"
import { authErrorMessage } from "@/lib/api/auth"
import {
  ADMIN_IMAGE_DIMENSIONS,
  imageDimensionLabel,
  validateImageDimensions,
} from "@/lib/admin/image-dimensions"
import {
  listAdminAttributes,
  type AdminAttribute,
} from "@/lib/api/attributes"
import { listAdminBrands, type AdminBrand } from "@/lib/api/brands"
import {
  listAdminCategories,
  type AdminCategory,
} from "@/lib/api/categories"
import {
  PRODUCT_STATUS_OPTIONS,
  createProduct,
  listAdminProducts,
  updateProduct,
  uploadProductImage,
  formatSomInput,
  parseSomInput,
  type AdminProduct,
  type ProductStatusTag,
} from "@/lib/api/products"
import { useAuthStore } from "@/lib/auth/store"

const SKELETON_ROWS = 6
const NONE_VALUE = "__none__"

function attributeLabel(attr: AdminAttribute) {
  const unit = attributeUnitLabel(attr.unit)
  return unit === "—"
    ? `${attr.name}: ${attr.value}`
    : `${attr.name}: ${attr.value} ${unit}`
}

function remainingDays(iso: string | null | undefined) {
  if (!iso) return ""
  const ms = new Date(iso).getTime() - Date.now()
  if (!Number.isFinite(ms) || ms <= 0) return "1"
  return String(Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000))))
}

export function ProductsPage() {
  const token = useAuthStore((state) => state.token)
  const [items, setItems] = React.useState<AdminProduct[]>([])
  const [brands, setBrands] = React.useState<AdminBrand[]>([])
  const [categories, setCategories] = React.useState<AdminCategory[]>([])
  const [attributes, setAttributes] = React.useState<AdminAttribute[]>([])
  const [loading, setLoading] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<AdminProduct | null>(null)
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [priceAmount, setPriceAmount] = React.useState("")
  const [salePriceAmount, setSalePriceAmount] = React.useState("")
  const [brand, setBrand] = React.useState("")
  const [categorySlug, setCategorySlug] = React.useState("")
  const [attributeIds, setAttributeIds] = React.useState<string[]>([])
  const [statusTags, setStatusTags] = React.useState<ProductStatusTag[]>([])
  const [seasonalDays, setSeasonalDays] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [stockUnlimited, setStockUnlimited] = React.useState(true)
  const [stockQty, setStockQty] = React.useState("")
  const [imageUrls, setImageUrls] = React.useState<string[]>([])
  const [pending, setPending] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [products, brandList, categoryList, attributeList] =
        await Promise.all([
          listAdminProducts(token),
          listAdminBrands(token),
          listAdminCategories(token),
          listAdminAttributes(token),
        ])
      setItems(products)
      setBrands(brandList.filter((item) => item.isActive))
      setCategories(categoryList.filter((item) => item.isActive))
      setAttributes(attributeList.filter((item) => item.isActive))
    } catch {
      setItems([])
      setBrands([])
      setCategories([])
      setAttributes([])
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
        item.code.toLowerCase().includes(q) ||
        (item.brand ?? "").toLowerCase().includes(q),
    )
  }, [items, query])

  function resetForm() {
    setName("")
    setCode("")
    setPriceAmount("")
    setSalePriceAmount("")
    setBrand("")
    setCategorySlug("")
    setAttributeIds([])
    setStatusTags([])
    setSeasonalDays("")
    setDescription("")
    setStockUnlimited(true)
    setStockQty("")
    setImageUrls([])
    if (fileRef.current) fileRef.current.value = ""
  }

  function openCreate() {
    setEditing(null)
    resetForm()
    setDialogOpen(true)
  }

  function openEdit(product: AdminProduct) {
    setEditing(product)
    setName(product.name)
    setCode(product.code)
    setPriceAmount(formatSomInput(String(product.price.amount)))
    setSalePriceAmount(
      product.salePrice
        ? formatSomInput(String(product.salePrice.amount))
        : "",
    )
    setBrand(product.brand ?? "")
    setCategorySlug(product.categorySlug ?? "")
    setAttributeIds(product.attributeIds ?? [])
    setStatusTags(
      product.statusTags.filter((tag): tag is ProductStatusTag =>
        PRODUCT_STATUS_OPTIONS.some((option) => option.value === tag),
      ),
    )
    setSeasonalDays(
      product.statusTags.includes("seasonal")
        ? remainingDays(product.seasonalExpiresAt)
        : "",
    )
    setDescription(product.description ?? "")
    const unlimited = product.stockUnlimited ?? true
    setStockUnlimited(unlimited)
    setStockQty(unlimited ? "" : String(product.stockQty ?? 0))
    setImageUrls(
      product.imageUrls?.length
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : [],
    )
    if (fileRef.current) fileRef.current.value = ""
    setDialogOpen(true)
  }

  function toggleAttribute(id: string) {
    setAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  function toggleStatus(tag: ProductStatusTag) {
    setStatusTags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((item) => item !== tag)
        if (tag === "seasonal") setSeasonalDays("")
        return next
      }
      return [...prev, tag]
    })
  }

  async function onToggle(product: AdminProduct, next: boolean) {
    if (!token || togglingId) return
    setTogglingId(product.id)
    setItems((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, isActive: next } : item,
      ),
    )
    try {
      const updated = await updateProduct(token, product.id, {
        isActive: next,
      })
      setItems((prev) =>
        prev.map((item) => (item.id === product.id ? updated : item)),
      )
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, isActive: product.isActive }
            : item,
        ),
      )
      toast.error(authErrorMessage(error, "Faol"))
    } finally {
      setTogglingId(null)
    }
  }

  async function onPickImages(files: FileList | null) {
    if (!token || !files?.length || uploading) return
    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error("Rasm")
          continue
        }
        const check = await validateImageDimensions(
          file,
          ADMIN_IMAGE_DIMENSIONS.products,
        )
        if (!check.ok) {
          toast.error(check.message)
          continue
        }
        urls.push(await uploadProductImage(token, file))
      }
      if (urls.length) {
        setImageUrls((prev) => [...prev, ...urls])
      }
    } catch (error) {
      toast.error(authErrorMessage(error, "Rasm"))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((item) => item !== url))
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    if (!token || pending) return

    const nextName = name.trim()
    const nextCode = code.trim()
    const amount = parseSomInput(priceAmount)
    const saleAmount = salePriceAmount.trim()
      ? parseSomInput(salePriceAmount)
      : null
    if (!nextName || !nextCode || !Number.isFinite(amount) || amount < 0) {
      return
    }
    if (
      saleAmount !== null &&
      (!Number.isFinite(saleAmount) || saleAmount < 0)
    ) {
      return
    }
    if (statusTags.includes("seasonal")) {
      const days = Number(seasonalDays)
      if (!Number.isInteger(days) || days < 1) {
        toast.error("Kun")
        return
      }
    }

    let nextStockQty: number | undefined
    if (!stockUnlimited) {
      const qty = Number(stockQty)
      if (!Number.isInteger(qty) || qty < 0) {
        toast.error("Soni")
        return
      }
      nextStockQty = qty
    }

    setPending(true)
    try {
      const body = {
        name: nextName,
        code: nextCode,
        description: description.length > 0 ? description : "",
        price: { amount, currency: "UZS" as const },
        ...(saleAmount === null
          ? editing
            ? { salePrice: null as null }
            : {}
          : { salePrice: { amount: saleAmount, currency: "UZS" as const } }),
        brand: brand || undefined,
        categorySlug: categorySlug || undefined,
        attributeIds,
        statusTags,
        imageUrls,
        imageUrl: imageUrls[0],
        stockUnlimited,
        ...(stockUnlimited ? {} : { stockQty: nextStockQty }),
        ...(statusTags.includes("seasonal")
          ? { seasonalDays: Number(seasonalDays) }
          : {}),
      }

      if (editing) {
        const updated = await updateProduct(token, editing.id, body)
        setItems((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item)),
        )
      } else {
        const created = await createProduct(token, body)
        setItems((prev) => [created, ...prev])
      }
      setDialogOpen(false)
      toast.success("Saqlash")
    } catch (error) {
      toast.error(authErrorMessage(error, "Saqlash"))
    } finally {
      setPending(false)
    }
  }

  const canSave =
    name.trim() &&
    code.trim() &&
    priceAmount !== "" &&
    Number.isFinite(parseSomInput(priceAmount)) &&
    parseSomInput(priceAmount) >= 0 &&
    (salePriceAmount.trim() === "" ||
      (Number.isFinite(parseSomInput(salePriceAmount)) &&
        parseSomInput(salePriceAmount) >= 0)) &&
    (!statusTags.includes("seasonal") ||
      (Number.isInteger(Number(seasonalDays)) && Number(seasonalDays) >= 1)) &&
    (stockUnlimited ||
      (stockQty !== "" &&
        Number.isInteger(Number(stockQty)) &&
        Number(stockQty) >= 0))

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
            <TableHead>Maxsulot nomi</TableHead>
            <TableHead className="hidden sm:table-cell">Maxsulot codi</TableHead>
            <TableHead className="hidden md:table-cell">Brend</TableHead>
            <TableHead className="w-20">Faol</TableHead>
            <TableHead className="w-28" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={`sk-${index}`}>
                  <TableCell>
                    <Skeleton className="size-10 rounded-2xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32 max-w-full" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8 rounded-2xl" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="size-9 rounded-2xl" />
                  </TableCell>
                </TableRow>
              ))
            : filtered.map((product) => {
                const thumb =
                  product.imageUrls?.[0] || product.imageUrl || null
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative size-10 overflow-hidden rounded-2xl bg-muted">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate font-medium md:max-w-none">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden max-w-[8rem] truncate sm:table-cell">
                      {product.code}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.brand || "—"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isActive}
                        disabled={togglingId === product.id}
                        onCheckedChange={(checked) =>
                          onToggle(product, checked)
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
                        onClick={() => openEdit(product)}
                      >
                        <IconPencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={onSave} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Tahrirlash" : "Qo'shish"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>
                  {imageDimensionLabel(
                    "Rasmlar",
                    ADMIN_IMAGE_DIMENSIONS.products,
                  )}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="relative size-20 overflow-hidden rounded-2xl bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="size-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground"
                        aria-label="O'chirish"
                        onClick={() => removeImage(url)}
                      >
                        <IconX className="size-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="flex size-20 flex-col items-center justify-center gap-1 rounded-2xl bg-muted text-muted-foreground"
                    aria-label="Rasm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <IconCamera className="size-5" />
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => onPickImages(event.target.files)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-name">Maxsulot nomi</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-code">Maxsulot codi</Label>
                <Input
                  id="product-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-stock-qty">Soni</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Input
                    id="product-stock-qty"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={stockUnlimited ? "" : stockQty}
                    onChange={(event) => setStockQty(event.target.value)}
                    disabled={stockUnlimited}
                    className="h-11 sm:min-w-0 sm:flex-1"
                    required={!stockUnlimited}
                  />
                  <label className="flex min-h-11 shrink-0 cursor-pointer items-center gap-3 sm:pl-1">
                    <Switch
                      checked={stockUnlimited}
                      onCheckedChange={(checked) => {
                        setStockUnlimited(checked)
                        if (checked) setStockQty("")
                      }}
                      aria-label="cheksiz"
                    />
                    <span className="text-sm">cheksiz</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-price">Oddiy narxi</Label>
                <Input
                  id="product-price"
                  inputMode="numeric"
                  value={priceAmount}
                  onChange={(event) =>
                    setPriceAmount(formatSomInput(event.target.value))
                  }
                  placeholder="100 000"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-sale-price">Skidkadagi narxi</Label>
                <Input
                  id="product-sale-price"
                  inputMode="numeric"
                  value={salePriceAmount}
                  onChange={(event) =>
                    setSalePriceAmount(formatSomInput(event.target.value))
                  }
                  placeholder="100 000"
                  className="h-11"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-brand">Maxsulot brendi</Label>
                <Select
                  value={brand || NONE_VALUE}
                  onValueChange={(next) => {
                    if (next === null) return
                    setBrand(next === NONE_VALUE ? "" : next)
                  }}
                >
                  <SelectTrigger id="product-brand" className="h-11 w-full">
                    <SelectValue>
                      {(selected: string | null) => {
                        if (!selected || selected === NONE_VALUE) return "—"
                        return selected
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    <SelectItem value={NONE_VALUE} className="min-h-11">
                      —
                    </SelectItem>
                    {brands.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.name}
                        className="min-h-11"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-category">Maxsulot kategoriyasi</Label>
                <Select
                  value={categorySlug || NONE_VALUE}
                  onValueChange={(next) => {
                    if (next === null) return
                    setCategorySlug(next === NONE_VALUE ? "" : next)
                  }}
                >
                  <SelectTrigger id="product-category" className="h-11 w-full">
                    <SelectValue>
                      {(selected: string | null) => {
                        if (!selected || selected === NONE_VALUE) return "—"
                        return (
                          categories.find((item) => item.slug === selected)
                            ?.name ?? selected
                        )
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false} align="start">
                    <SelectItem value={NONE_VALUE} className="min-h-11">
                      —
                    </SelectItem>
                    {categories.map((item) => (
                      <SelectItem
                        key={item.id}
                        value={item.slug}
                        className="min-h-11"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Maxsulot xususiyati</Label>
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-2xl bg-muted/40 p-3">
                  {attributes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">—</p>
                  ) : (
                    attributes.map((attr) => {
                      const checked = attributeIds.includes(attr.id)
                      return (
                        <label
                          key={attr.id}
                          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="size-4 rounded border-input"
                            checked={checked}
                            onChange={() => toggleAttribute(attr.id)}
                          />
                          <span className="min-w-0 break-all">
                            {attributeLabel(attr)}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Maxsulot status</Label>
                <div className="grid gap-2 rounded-2xl bg-muted/40 p-3">
                  {PRODUCT_STATUS_OPTIONS.map((option) => {
                    const checked = statusTags.includes(option.value)
                    return (
                      <label
                        key={option.value}
                        className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={checked}
                          onChange={() => toggleStatus(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    )
                  })}
                  {statusTags.includes("seasonal") ? (
                    <div className="grid gap-1.5 pt-1">
                      <Label htmlFor="seasonal-days">Kun</Label>
                      <Input
                        id="seasonal-days"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={seasonalDays}
                        onChange={(event) =>
                          setSeasonalDays(event.target.value)
                        }
                        className="h-11"
                        required
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-description">Maxsulot tavsifi</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-32 whitespace-pre-wrap"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto"
                disabled={pending || uploading || !canSave}
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
