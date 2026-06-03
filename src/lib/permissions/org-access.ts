import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { ClassRepository } from "@/lib/repositories/class-repository"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import type { ClassMember } from "@/lib/types/database"

const orgMemberRepository = new OrganizationMemberRepository()
const classRepository = new ClassRepository()

export async function isOrgOwner(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const member = await orgMemberRepository.getByOrgAndUser(organizationId, userId)
  return normalizeOrgRole(member?.role) === "owner"
}

export async function countOrgOwners(organizationId: string): Promise<number> {
  const members = await orgMemberRepository.getByOrganization(organizationId)
  return members.filter((m) => normalizeOrgRole(m.role) === "owner").length
}

/** True when the user is an owner of the organization that owns this class. */
export async function isOrgOwnerForClass(
  classId: string,
  userId: string
): Promise<boolean> {
  const cls = await classRepository.getById(classId)
  if (!cls) return false
  return isOrgOwner(cls.organizationId, userId)
}

/** Virtual membership so org owners can access classes they are not enrolled in. */
export function syntheticOrgOwnerClassMember(
  classId: string,
  userId: string
): ClassMember {
  return {
    id: `org-owner-access:${classId}:${userId}`,
    classId,
    userId,
    role: "teacher",
    joinedAt: new Date().toISOString(),
  }
}
