import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { buildJWTPayload } from "@/lib/auth/build-payload"
import { signToken } from "@/lib/jwt"

const orgMemberRepository = new OrganizationMemberRepository()

export async function finalizeLogin(
  userId: string
): Promise<{ redirectPath: string; token: string }> {
  const memberships = await orgMemberRepository.getByUser(userId)

  if (memberships.length === 0) {
    const token = await signToken(await buildJWTPayload(userId))
    return { redirectPath: "/organizations", token }
  }

  if (memberships.length === 1) {
    const payload = await buildJWTPayload(userId, memberships[0].organizationId)
    const token = await signToken(payload)
    return { redirectPath: "/app", token }
  }

  const payload = await buildJWTPayload(userId)
  const redirectPath = payload.activeOrganizationId ? "/app" : "/organizations"
  const token = await signToken(payload)
  return { redirectPath, token }
}
