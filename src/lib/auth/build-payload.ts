import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import type { JWTPayload, OrgRole } from "@/lib/jwt"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import { isPlatformAdmin } from "@/lib/auth/platform-admin"

const profileRepository = new ProfileRepository()
const orgMemberRepository = new OrganizationMemberRepository()

export async function buildJWTPayload(
  userId: string,
  activeOrganizationId?: string
): Promise<JWTPayload> {
  const profile = await profileRepository.getById(userId)
  if (!profile) {
    console.error(`[buildJWTPayload] Profile not found for userId: ${userId}`)
    throw new Error("User not found")
  }

  const memberships = await orgMemberRepository.getByUser(userId)
  const activeOrgId =
    activeOrganizationId ??
    memberships[0]?.organizationId

  let orgRole: OrgRole | undefined
  if (activeOrgId) {
    const membership = memberships.find((m) => m.organizationId === activeOrgId)
    orgRole = membership?.role
      ? (normalizeOrgRole(membership.role) as OrgRole)
      : undefined
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName ?? "",
    avatarUrl: profile.avatarUrl,
    platformRole: isPlatformAdmin(profile) ? "admin" : undefined,
    activeOrganizationId: activeOrgId,
    orgRole,
  }
}
