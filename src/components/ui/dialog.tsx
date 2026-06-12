"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

// ── Context ──────────────────────────────────────────────────────────────────

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog compound components must be used inside <Dialog>")
  return ctx
}

// ── Root ─────────────────────────────────────────────────────────────────────

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  defaultOpen?: boolean
}

function Dialog({ open: controlledOpen, onOpenChange, children, defaultOpen = false }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value)
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

// ── Trigger ───────────────────────────────────────────────────────────────────

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const { setOpen } = useDialogContext()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        const original = (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick
        original?.(e)
        setOpen(true)
      },
    })
  }

  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

// ── Portal ────────────────────────────────────────────────────────────────────

interface DialogPortalProps {
  children: React.ReactNode
}

function DialogPortal({ children }: DialogPortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}

// ── Overlay ───────────────────────────────────────────────────────────────────

interface DialogOverlayProps extends React.ComponentProps<"div"> {
  className?: string
}

function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const { open } = useDialogContext()

  if (!open) return null

  return (
    <div
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/80 backdrop-blur-xs",
        "animate-in fade-in-0 duration-100",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

// ── Close ─────────────────────────────────────────────────────────────────────

interface DialogCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  children?: React.ReactNode
}

function DialogClose({ asChild, children, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        const original = (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick
        original?.(e)
        setOpen(false)
      },
    })
  }

  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  )
}

// ── Content ───────────────────────────────────────────────────────────────────

interface DialogContentProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean
  children?: React.ReactNode
}

function DialogContent({ className, children, showCloseButton = true, ...props }: DialogContentProps) {
  const { open, setOpen } = useDialogContext()

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <DialogPortal>
      <DialogOverlay />
    
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setOpen(false)}
      >
        <div
          data-slot="dialog-content"
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative grid w-full max-w-[calc(100%-2rem)]",
            "gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/5",
            "outline-none sm:max-w-md",
            "animate-in fade-in-0 zoom-in-95 duration-100",
            className
          )}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
          {showCloseButton && (
            <Button
              variant="ghost"
              className="absolute top-4 right-4"
              size="icon-sm"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>
    </DialogPortal>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

interface DialogFooterProps extends React.ComponentProps<"div"> {
  showCloseButton?: boolean
  children?: React.ReactNode
}

function DialogFooter({ className, showCloseButton = false, children, ...props }: DialogFooterProps) {
  const { setOpen } = useDialogContext()
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Button variant="outline" onClick={() => setOpen(false)}>
          Close
        </Button>
      )}
    </div>
  )
}

// ── Title ─────────────────────────────────────────────────────────────────────

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("font-heading text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

// ── Description ───────────────────────────────────────────────────────────────

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-3 [&_a:hover]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
