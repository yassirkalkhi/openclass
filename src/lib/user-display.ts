export function getUserInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "?"
}
