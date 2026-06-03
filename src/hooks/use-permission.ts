"use client"

import { useClass } from "@/context/class-context"
import type { Permission } from "@/lib/types/database"

export function usePermission(key: Permission["key"]): boolean {
  const { permissions } = useClass()
  return permissions.find((p) => p.key === key)?.enabled ?? false
}
