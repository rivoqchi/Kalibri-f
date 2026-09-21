"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuthHydrated } from "@/hooks/use-auth-hydrated"
import {
  authErrorMessage,
  fetchTelegramBotInfo,
  verifyTelegramCode,
  verifyTelegramWebApp,
  type TelegramBotInfo,
} from "@/lib/api/auth"
import { useAuthStore } from "@/lib/auth/store"

type TelegramWebApp = {
  initData?: string
  ready?: () => void
}

function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null
  return (
    window as Window & { Telegram?: { WebApp?: TelegramWebApp } }
  ).Telegram?.WebApp ?? null
}

function safeNextPath(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return "/profile"
}

const otpSlotClass =
  "*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hydrated = useAuthHydrated()
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)
  const [bot, setBot] = React.useState<TelegramBotInfo | null>(null)
  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState(false)
  const webAppTried = React.useRef(false)

  const nextPath = safeNextPath(searchParams.get("next"))

  React.useEffect(() => {
    if (!hydrated || !token) return
    router.replace(nextPath)
  }, [hydrated, token, nextPath, router])

  React.useEffect(() => {
    let cancelled = false
    fetchTelegramBotInfo()
      .then((info) => {
        if (!cancelled) setBot(info)
      })
      .catch((err) => {
        if (!cancelled) setError(authErrorMessage(err, "Telegram bot"))
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!hydrated || token || webAppTried.current) return
    const webApp = getTelegramWebApp()
    const initData = webApp?.initData?.trim()
    if (!initData) return
    webAppTried.current = true
    webApp?.ready?.()
    setPending(true)
    verifyTelegramWebApp(initData)
      .then(({ token: sessionToken, user }) => {
        setSession(sessionToken, user)
        router.replace(nextPath)
      })
      .catch(() => {
        setPending(false)
      })
  }, [hydrated, token, nextPath, router, setSession])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = code.trim()
    if (!/^\d{4}$/.test(trimmed) || pending) return
    setPending(true)
    setError(null)
    try {
      const result = await verifyTelegramCode(trimmed)
      setSession(result.token, result.user)
      router.replace(nextPath)
    } catch (err) {
      setError(authErrorMessage(err, "Kod"))
      setPending(false)
    }
  }

  if (hydrated && token) return null

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <CardTitle>Kirish</CardTitle>
        <CardDescription className="max-w-sm leading-snug">
          Telegram botga kiring
          {bot ? (
            <>
              {" "}
              <a
                href={bot.deepLink}
                target="_blank"
                rel="noreferrer"
                className="text-foreground"
              >
                @{bot.username}
              </a>
            </>
          ) : null}
          . Start bosing. «Kod yuborish» tugmasini bosing. Kodni shu yerga
          yozing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={onSubmit}>
          <Field
            className="items-center text-center"
            data-invalid={Boolean(error) || undefined}
          >
            <InputOTP
              maxLength={4}
              id="otp-verification"
              value={code}
              onChange={(value) => {
                setCode(value.replace(/\D/g, "").slice(0, 4))
                if (error) setError(null)
              }}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={pending}
              containerClassName="justify-center"
              required
            >
              <InputOTPGroup className={otpSlotClass}>
                <InputOTPSlot index={0} aria-invalid={Boolean(error)} />
                <InputOTPSlot index={1} aria-invalid={Boolean(error)} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className={otpSlotClass}>
                <InputOTPSlot index={2} aria-invalid={Boolean(error)} />
                <InputOTPSlot index={3} aria-invalid={Boolean(error)} />
              </InputOTPGroup>
            </InputOTP>
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          <Button
            type="submit"
            form="login-form"
            className="h-11 w-full"
            disabled={pending || code.length !== 4}
          >
            Kirish
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
