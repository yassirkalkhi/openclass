"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const SheetContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(
  null
)

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [internal, setInternal] = React.useState(false)
  const isOpen = open ?? internal
  const setOpen = onOpenChange ?? setInternal
  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen }}>{children}</SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const ctx = React.useContext(SheetContext)!
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx.setOpen(true),
    })
  }
  return (
    <button type="button" onClick={() => ctx.setOpen(true)}>
      {children}
    </button>
  )
}

function SheetContent({
  side = "right",
  className,
  children,
}: {
  side?: "left" | "right"
  className?: string
  children: React.ReactNode
}) {
  const ctx = React.useContext(SheetContext)!
  if (!ctx.open) return null
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "fixed z-50 flex h-full w-full max-w-sm flex-col border bg-background shadow-lg",
          side === "right" ? "right-0 top-0" : "left-0 top-0",
          className
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          onClick={() => ctx.setOpen(false)}
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </>
  )
}

export { Sheet, SheetTrigger, SheetContent }
