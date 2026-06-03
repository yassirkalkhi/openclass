import type { Profile } from "@/lib/types/database"

export function isPlatformAdminEmail(email: string): boolean {
  const allowlist = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? []
  return allowlist.includes(email.toLowerCase())
}

export function isPlatformAdmin(profile: Pick<Profile, "email" | "platformAdmin">): boolean {
  return profile.platformAdmin === true || isPlatformAdminEmail(profile.email)
}
