import { ProfileRepository } from "./profile-repository"
import { OrganizationMemberRepository } from "./organization-member-repository"
import { buildJWTPayload } from "@/lib/auth/build-payload"
import type { Profile } from "@/lib/types/database"
import type { JWTPayload } from "@/lib/jwt"

const profileRepository = new ProfileRepository()
const orgMemberRepository = new OrganizationMemberRepository()

export class UserRepository {
  async getUserByEmail(email: string): Promise<JWTPayload | null> {
    const profile = await profileRepository.getByEmail(email)
    if (!profile) return null
    return buildJWTPayload(profile.id)
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    return profileRepository.getByEmail(email)
  }

  async getUserHaveOrganization(
    userId: string
  ): Promise<{ organizationId: string; role: string } | null> {
    const memberships = await orgMemberRepository.getByUser(userId)
    if (memberships.length === 0) return null
    return {
      organizationId: memberships[0].organizationId,
      role: memberships[0].role,
    }
  }

  async getProfileById(userId: string) {
    return profileRepository.getById(userId)
  }
}
