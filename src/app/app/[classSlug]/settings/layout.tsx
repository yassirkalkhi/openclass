"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { classSlug: string } | Promise<{ classSlug: string }>
}) {
  const pathname = usePathname()

  // params may be async in Next.js 15 — resolve slug from the current path instead
  const base = pathname.split("/settings")[0] + "/settings"

  const links = [
    { href: base, label: "General" },
    { href: `${base}/members`, label: "Members" },
    { href: `${base}/permissions`, label: "Permissions" },
  ]

  return (
    <div className="flex h-full">
      <nav className="w-48 shrink-0 border-r p-3 space-y-0.5 text-sm">
        {links.map(({ href, label }) => {
          const isActive =
            href === base ? pathname === base || pathname === base + "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-md px-2 py-1.5 transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
