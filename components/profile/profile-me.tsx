"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconCamera, IconLayoutDashboard, IconLogout, IconPencil } from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthPhoto } from "@/hooks/use-auth-photo"
import {
  ADMIN_IMAGE_DIMENSIONS,
  imageDimensionLabel,
  validateImageDimensions,
} from "@/lib/admin/image-dimensions"
import {
  authErrorMessage,
  updateAuthMe,
  updateAuthMePhoto,
} from "@/lib/api/auth"
import { useAuthStore, type AuthUser } from "@/lib/auth/store"

function initials(user: AuthUser) {
  const letters = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.trim()
  return (letters || user.firstName.charAt(0) || "?").toUpperCase()
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <p className="min-h-11 rounded-2xl bg-muted/50 px-3 py-2.5 text-sm break-all">
        {value}
      </p>
    </div>
  )
}

export function ProfileMe({
  user,
  token,
  onUser,
}: {
  user: AuthUser
  token: string
  onUser: (user: AuthUser) => void
}) {
  const photoSrc = useAuthPhoto(user.photoUrl, token, user.photoRevision)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()
  const clearSession = useAuthStore((state) => state.clearSession)
  const [open, setOpen] = React.useState(false)
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [firstName, setFirstName] = React.useState(user.firstName)
  const [lastName, setLastName] = React.useState(user.lastName)
  const [photoFile, setPhotoFile] = React.useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setPhotoFile(null)
    setPhotoPreview(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ""
  }, [open, user.firstName, user.lastName])

  React.useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photoFile])

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    const nextFirst = firstName.trim()
    if (!nextFirst || pending) return
    setPending(true)
    setError(null)
    try {
      let nextUser = user
      if (photoFile) {
        nextUser = await updateAuthMePhoto(token, photoFile)
      }
      nextUser = await updateAuthMe(token, {
        firstName: nextFirst,
        lastName: lastName.trim(),
      })
      onUser(nextUser)
      setOpen(false)
    } catch (err) {
      setError(authErrorMessage(err, "Tahrirlash"))
    } finally {
      setPending(false)
    }
  }

  const editPhotoSrc = photoPreview ?? photoSrc

  return (
    <Card className="rounded-none border-0 bg-transparent py-0 shadow-none ring-0">
      <CardHeader className="flex flex-row items-center gap-4 px-0">
        <Avatar
          size="lg"
          className="size-20 after:rounded-full data-[size=lg]:size-20 md:size-24 md:data-[size=lg]:size-24"
        >
          {photoSrc ? <AvatarImage src={photoSrc} alt="" /> : null}
          <AvatarFallback className="text-lg">
            {initials(user)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{user.fullName}</p>
          {user.username ? (
            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 px-0">
        <Separator />
        <Field label="Ism" value={user.firstName} />
        <Field label="Familya" value={user.lastName} />
        <Field label="Telefon" value={user.phone ?? ""} />
        <Field
          label="Username"
          value={user.username ? `@${user.username}` : ""}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 px-0 sm:flex-row sm:flex-wrap">
        {user.role === "super_admin" || user.role === "admin" ? (
          <Button
            className="h-11 w-full sm:w-auto"
            render={<Link href="/admin" />}
          >
            <IconLayoutDashboard data-icon="inline-start" />
            Admin panel
          </Button>
        ) : null}
        <Button
          type="button"
          className="h-11 w-full sm:w-auto"
          onClick={() => setOpen(true)}
        >
          <IconPencil data-icon="inline-start" />
          Tahrirlash
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full sm:w-auto"
          onClick={() => setLogoutOpen(true)}
        >
          <IconLogout data-icon="inline-start" />
          Chiqish
        </Button>
      </CardFooter>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={onSave} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Tahrirlash</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="profile-photo">
                  {imageDimensionLabel(
                    "Rasm",
                    ADMIN_IMAGE_DIMENSIONS.avatars,
                  )}
                </Label>
                <button
                  type="button"
                  className="relative size-24 rounded-full"
                  aria-label="Rasm"
                  onClick={() => fileRef.current?.click()}
                >
                  <Avatar
                    size="lg"
                    className="size-24 after:rounded-full data-[size=lg]:size-24"
                  >
                    {editPhotoSrc ? (
                      <AvatarImage src={editPhotoSrc} alt="" />
                    ) : null}
                    <AvatarFallback className="text-lg">
                      {initials(user)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-popover">
                    <IconCamera className="size-4" />
                  </span>
                </button>
                <input
                  id="profile-photo"
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const input = event.target
                    const file = input.files?.[0] ?? null
                    input.value = ""
                    if (!file) {
                      setPhotoFile(null)
                      return
                    }
                    if (!file.type.startsWith("image/")) {
                      setError("Rasm")
                      setPhotoFile(null)
                      return
                    }
                    void validateImageDimensions(
                      file,
                      ADMIN_IMAGE_DIMENSIONS.avatars,
                    ).then((check) => {
                      if (!check.ok) {
                        setError(check.message)
                        setPhotoFile(null)
                        return
                      }
                      setError(null)
                      setPhotoFile(file)
                    })
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="profile-first-name">Ism</Label>
                <Input
                  id="profile-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="h-11"
                  autoComplete="given-name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="profile-last-name">Familya</Label>
                <Input
                  id="profile-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="h-11"
                  autoComplete="family-name"
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="h-11 w-full sm:w-auto"
                disabled={pending || !firstName.trim()}
              >
                <IconPencil data-icon="inline-start" />
                Tahrirlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rostanham chiqishni xoxlaysizmi?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full sm:w-auto"
              onClick={() => {
                setLogoutOpen(false)
                clearSession()
                router.replace("/login")
              }}
            >
              <IconLogout data-icon="inline-start" />
              Chiqish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
