import Link from "next/link"
import { cn } from "@/lib/utils"

interface OpenClassLogoProps {
  href?: string
  className?: string
  /** Controls the overall size. Defaults to "md". */
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: { wrapper: "gap-0.5", open: "text-sm", class: "text-sm", dot: "size-1.5" },
  md: { wrapper: "gap-0.5", open: "text-base", class: "text-base", dot: "size-2" },
  lg: { wrapper: "gap-1", open: "text-2xl", class: "text-2xl", dot: "size-2.5" },
}

export function OpenClassLogo({ href = "/app", className, size = "md" }: OpenClassLogoProps) {
  const s = sizeMap[size]

  const logo = (
    <span
      className={cn(
        "inline-flex items-baseline select-none leading-none",
        s.wrapper,
        className
      )}
      aria-label="OpenClass"
    >
      {/* "Open" — light weight, muted */}
      <span
        className={cn(
          "font-light tracking-tight text-foreground/70",
          s.open
        )}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Open
      </span>

      {/* Accent dot — primary color */}
      <span
        className={cn(
          "inline-block rounded-full bg-primary self-center mx-px",
          s.dot
        )}
        aria-hidden="true"
      />

      {/* "Class" — bold, primary color */}
      <span
        className={cn(
          "font-bold tracking-tight text-primary",
          s.class
        )}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Class
      </span>
    </span>
  )

  if (!href) return logo

  return (
    <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
      {logo}
    </Link>
  )
}
