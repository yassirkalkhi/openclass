import type { ClassMember, OrganizationMember } from "@/lib/types/database"

/** Map legacy org roles (teacher/student) to member. */
export function normalizeOrgRole(
  role: string | undefined
): OrganizationMember["role"] {
  if (role === "owner") return "owner"
  return "member"
}

/** Map legacy class owner role to teacher. */
export function normalizeClassRole(
  role: string | undefined
): ClassMember["role"] {
  if (role === "teacher" || role === "owner") return "teacher"
  return "student"
}
