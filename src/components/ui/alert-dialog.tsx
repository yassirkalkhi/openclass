"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

// ── Context ───────────────────────────────────────────────────────────────────

interface AlertDialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

function useAlertDialogContext() {
  const ctx = React.useContext(AlertDialogContext)
  if (!ctx) throw new Error("AlertDialog compound components must be used inside <AlertDialog>")
  return ctx
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  defaultOpen?: boolean
}

function AlertDialog({ open: controlledOpen, onOpenChange, children, defaultOpen = false }: AlertDialogProps) {
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
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

// ── Trigger ───────────────────────────────────────────────────────────────────

interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const { setOpen } = useAlertDialogContext()

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

interface AlertDialogPortalProps {
  children: React.ReactNode
}

function AlertDialogPortal({ children }: AlertDialogPortalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null
  return createPortal(children, document.body)
}

// ── Overlay ───────────────────────────────────────────────────────────────────

interface AlertDialogOverlayProps extends React.ComponentProps<"div"> {
  className?: string
}

function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  // Note: AlertDialog overlay does NOT close on click (intentional — forces explicit action)
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        "animate-in fade-in-0 duration-100",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  )
}

// ── Content ───────────────────────────────────────────────────────────────────

function AlertDialogContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { open } = useAlertDialogContext()

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
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "gap-4 border bg-background p-6 shadow-lg",
          "sm:rounded-lg",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </AlertDialogPortal>
  )
}

// ── Header ────────────────────────────────────────────────────────────────────

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

// ── Title ─────────────────────────────────────────────────────────────────────

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

// ── Description ───────────────────────────────────────────────────────────────

interface AlertDialogDescriptionProps extends React.ComponentProps<"div"> {
  asChild?: boolean
  children?: React.ReactNode
}

function AlertDialogDescription({ className, asChild, children, ...props }: AlertDialogDescriptionProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn("text-sm text-muted-foreground", (children as React.ReactElement<{ className?: string }>).props.className),
    })
  }
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

// ── Action ────────────────────────────────────────────────────────────────────

function AlertDialogAction({ className, children, onClick, ...props }: React.ComponentProps<"button">) {
  const { setOpen } = useAlertDialogContext()

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

// ── Cancel ────────────────────────────────────────────────────────────────────

function AlertDialogCancel({ className, children, onClick, ...props }: React.ComponentProps<"button">) {
  const { setOpen } = useAlertDialogContext()

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 mt-2 sm:mt-0",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
