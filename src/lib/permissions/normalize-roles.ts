import type { ClassMember, OrganizationMember } from "@/lib/types/database"

 export function normalizeOrgRole(
  role: string | undefined
): OrganizationMember["role"] {
  if (role === "owner") return "owner"
  return "member"
}

 
export function normalizeClassRole(
  role: string | undefined
): ClassMember["role"] {
  if (role === "teacher" || role === "owner") return "teacher"
  return "student"
}
