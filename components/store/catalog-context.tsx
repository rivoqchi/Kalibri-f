"use client"

import * as React from "react"

type CatalogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const CatalogContext = React.createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  return (
    <CatalogContext.Provider value={{ open, setOpen }}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const ctx = React.useContext(CatalogContext)
  if (!ctx) {
    throw new Error("useCatalog must be used within CatalogProvider")
  }
  return ctx
}
