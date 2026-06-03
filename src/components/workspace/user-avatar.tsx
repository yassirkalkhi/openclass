"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserInitials } from "@/lib/user-display"
import { cn } from "@/lib/utils"

export function UserAvatar({
  name,
  email,
  avatarUrl,
  size = "default",
  className,
}: {
  name?: string | null
  email?: string | null
  avatarUrl?: string | null
  size?: "default" | "sm" | "lg"
  className?: string
}) {
  const initials = getUserInitials(name, email)
  return (
    <Avatar size={size} className={className}>
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={name ?? email ?? "User"} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function RoleBadge({ role }: { role: "teacher" | "student" | "owner" | "member" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
        role === "teacher" || role === "owner"
          ? "border-primary/25 bg-primary/8 text-primary"
          : "border-border bg-muted/50 text-muted-foreground"
      )}
    >
      {role}
    </span>
  )
}
