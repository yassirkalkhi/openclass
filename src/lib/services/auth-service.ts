import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { hashPassword, verifyPassword } from "@/lib/hash"
import { signToken } from "@/lib/jwt"
import { setAuthCookie, clearAuthCookie } from "@/lib/cookies"
import { generateId } from "@/lib/utils"
import { buildJWTPayload } from "@/lib/auth/build-payload"
import { clearAdminOrgOverride } from "@/lib/auth/admin-cookies"
import type { Profile } from "@/lib/types/database"

const profileRepository = new ProfileRepository()
const orgMemberRepository = new OrganizationMemberRepository()

export class AuthService {
  async register(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ profile: Profile; token: string }> {
    const existing = await profileRepository.getByEmail(email)
    if (existing) {
      throw new Error("A user with this email already exists")
    }

    const id = generateId()
    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()

    const profile: Profile = {
      id,
      email,
      fullName,
      passwordHash,
      organizationIds: [],
      createdAt: now,
      updatedAt: now,
    }
    await profileRepository.create(profile)

    const payload = await buildJWTPayload(id)
    const token = await signToken(payload)
    await setAuthCookie(token)

    return { profile, token }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ profile: Profile; token: string }> {
    const profile = await profileRepository.getByEmail(email)
    if (!profile || !profile.passwordHash) {
      throw new Error("Invalid email or password")
    }

    const valid = await verifyPassword(password, profile.passwordHash)
    if (!valid) {
      throw new Error("Invalid email or password")
    }

    const payload = await buildJWTPayload(profile.id)
    const token = await signToken(payload)
    await setAuthCookie(token)

    return { profile, token }
  }

  async loginWithProfile(profile: Profile): Promise<string> {
    const payload = await buildJWTPayload(profile.id)
    const token = await signToken(payload)
    await setAuthCookie(token)
    return token
  }

  async logout(): Promise<void> {
    await clearAuthCookie()
    await clearAdminOrgOverride()
  }

  async getProfile(userId: string): Promise<Profile | null> {
    return profileRepository.getById(userId)
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<Profile, "fullName" | "avatarUrl" | "bio" | "status">>
  ): Promise<void> {
    await profileRepository.update(userId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  async switchOrganization(
    userId: string,
    organizationId: string
  ): Promise<string> {
    const membership = await orgMemberRepository.getByOrgAndUser(
      organizationId,
      userId
    )
    if (!membership) {
      throw new Error("You are not a member of this organization")
    }

    const payload = await buildJWTPayload(userId, organizationId)
    const token = await signToken(payload)
    await setAuthCookie(token)
    return token
  }

  async refreshToken(userId: string, activeOrganizationId?: string): Promise<string> {
    const payload = await buildJWTPayload(userId, activeOrganizationId)
    const token = await signToken(payload)
    await setAuthCookie(token)
    return token
  }

  async findOrCreateOAuthProfile(data: {
    email: string
    fullName: string
    avatarUrl?: string
  }): Promise<Profile> {
    const existing = await profileRepository.getByEmail(data.email)
    if (existing) return existing

    const id = generateId()
    const now = new Date().toISOString()
    const profile: Profile = {
      id,
      email: data.email,
      fullName: data.fullName,
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      organizationIds: [],
      createdAt: now,
      updatedAt: now,
    }
    await profileRepository.create(profile)
    return profile
  }
}
