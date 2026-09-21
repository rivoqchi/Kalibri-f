"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function ProfileSettings() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <Label htmlFor="profile-theme">Mavzu</Label>
      {mounted ? (
        <Switch
          id="profile-theme"
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Mavzu"
        />
      ) : (
        <div className="h-5 w-8 rounded-2xl bg-muted/50" aria-hidden />
      )}
    </div>
  )
}
