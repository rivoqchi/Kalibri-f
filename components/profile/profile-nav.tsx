"use client"

import { IconCheck, IconMenu2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const PROFILE_SECTIONS = [
  { id: "me", label: "Mening profilim" },
  { id: "orders", label: "Buyurtmalarim" },
  { id: "settings", label: "Sozlamalar" },
  { id: "prices", label: "Narxlar" },
  { id: "notifications", label: "Bildirishnomalar" },
  { id: "telegram", label: "Telegram bot" },
] as const

export type ProfileSectionId = (typeof PROFILE_SECTIONS)[number]["id"]

export function ProfileNav({
  section,
  onSectionChange,
}: {
  section: ProfileSectionId
  onSectionChange: (id: ProfileSectionId) => void
}) {
  const activeLabel =
    PROFILE_SECTIONS.find((item) => item.id === section)?.label ?? section

  return (
    <nav className="flex w-full shrink-0 items-center justify-end md:w-56 md:flex-col md:items-stretch md:justify-start md:gap-1">
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 border-0"
                aria-label={activeLabel}
              />
            }
          >
            <IconMenu2 className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 w-auto">
            {PROFILE_SECTIONS.map((item) => {
              const active = item.id === section
              return (
                <DropdownMenuItem
                  key={item.id}
                  className={cn(
                    "min-h-11 cursor-pointer",
                    active && "font-medium",
                  )}
                  onClick={() => onSectionChange(item.id)}
                >
                  <span className="flex-1">{item.label}</span>
                  {active ? <IconCheck className="size-4" /> : null}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        {PROFILE_SECTIONS.map((item) => {
          const active = item.id === section
          return (
            <Button
              key={item.id}
              type="button"
              variant={active ? "secondary" : "ghost"}
              className={cn(
                "h-11 w-full justify-start px-3 text-left",
                active && "font-medium",
              )}
              aria-current={active ? "page" : undefined}
              onClick={() => onSectionChange(item.id)}
            >
              {item.label}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
