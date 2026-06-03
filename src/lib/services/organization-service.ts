import { OrganizationRepository } from "@/lib/repositories/organization-repository"
import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { countOrgOwners, isOrgOwner } from "@/lib/permissions/org-access"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import { generateId } from "@/lib/utils"
import type { Organization, OrganizationMember } from "@/lib/types/database"

const organizationRepository = new OrganizationRepository()
const orgMemberRepository = new OrganizationMemberRepository()
const profileRepository = new ProfileRepository()

export class OrganizationService {
  /**
   * Create a new organization.
   * The creator becomes an owner.
   */
  async createOrganization(
    data: Pick<Organization, "name" | "slug" | "type" | "visibility"> & {
      description?: string
    },
    ownerId: string
  ): Promise<Organization> {
    const existingSlug = await organizationRepository.getBySlug(data.slug)
    if (existingSlug) {
      throw new Error("An organization with this slug already exists")
    }

    const now = new Date().toISOString()
    const orgId = generateId()
    const inviteCode = generateId().slice(0, 8).toUpperCase()

    const organization: Organization = {
      id: orgId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      ownerId,
      type: data.type,
      visibility: data.visibility,
      inviteCode,
      createdAt: now,
      updatedAt: now,
    }
    await organizationRepository.create(organization)

    const membership: OrganizationMember = {
      id: generateId(),
      organizationId: orgId,
      userId: ownerId,
      role: "owner",
      createdAt: now,
    }
    await orgMemberRepository.create(membership)

    await profileRepository.addOrganizationId(ownerId, orgId)

    return organization
  }

  /**
   * Join an organization by invite code (defaults to member).
   */
  async joinByInviteCode(
    code: string,
    userId: string,
    role: OrganizationMember["role"] = "member"
  ): Promise<OrganizationMember> {
    const org = await organizationRepository.getByInviteCode(code)
    if (!org) {
      throw new Error("Invalid invite code")
    }

    const existingMember = await orgMemberRepository.getByOrgAndUser(org.id, userId)
    if (existingMember) {
      throw new Error("You are already a member of this organization")
    }

    const membership: OrganizationMember = {
      id: generateId(),
      organizationId: org.id,
      userId,
      role: normalizeOrgRole(role),
      createdAt: new Date().toISOString(),
    }
    await orgMemberRepository.create(membership)
    await profileRepository.addOrganizationId(userId, org.id)

    return membership
  }

  /**
   * Update organization details. Only owners can update.
   */
  async updateOrganization(
    orgId: string,
    data: Partial<Pick<Organization, "name" | "description" | "visibility">>,
    requesterId: string
  ): Promise<void> {
    const org = await organizationRepository.getById(orgId)
    if (!org) throw new Error("Organization not found")

    if (!(await isOrgOwner(orgId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can update details")
    }

    await organizationRepository.update(orgId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Remove a member. Only owners can remove; cannot remove the last owner.
   */
  async removeMember(
    orgId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    if (!(await isOrgOwner(orgId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can remove members")
    }

    if (targetUserId === requesterId) {
      throw new Error("Cannot remove yourself. Leave the organization instead.")
    }

    const targetMember = await orgMemberRepository.getByOrgAndUser(orgId, targetUserId)
    if (!targetMember) throw new Error("Member not found")

    if (normalizeOrgRole(targetMember.role) === "owner") {
      const owners = await countOrgOwners(orgId)
      if (owners <= 1) {
        throw new Error("Cannot remove the last organization owner")
      }
    }

    await orgMemberRepository.deleteByOrgAndUser(orgId, targetUserId)
    await profileRepository.removeOrganizationId(targetUserId, orgId)
  }

  /**
   * Update a member's org role (owner | member). Only owners may change roles.
   */
  async updateMemberRole(
    orgId: string,
    targetUserId: string,
    newRole: OrganizationMember["role"],
    requesterId: string
  ): Promise<void> {
    if (!(await isOrgOwner(orgId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can change roles")
    }

    const normalizedRole = normalizeOrgRole(newRole)
    const targetMember = await orgMemberRepository.getByOrgAndUser(orgId, targetUserId)
    if (!targetMember) {
      throw new Error("Member not found")
    }

    const currentRole = normalizeOrgRole(targetMember.role)
    if (currentRole === "owner" && normalizedRole === "member") {
      const owners = await countOrgOwners(orgId)
      if (owners <= 1) {
        throw new Error("Cannot demote the last organization owner")
      }
    }

    await orgMemberRepository.update(targetMember.id, { role: normalizedRole })
  }

  /**
   * Regenerate the invite code. Only owners.
   */
  async regenerateInviteCode(orgId: string, requesterId: string): Promise<string> {
    if (!(await isOrgOwner(orgId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can regenerate invite codes")
    }

    const newCode = generateId().slice(0, 8).toUpperCase()
    await organizationRepository.update(orgId, {
      inviteCode: newCode,
      updatedAt: new Date().toISOString(),
    })
    return newCode
  }

  async getOrganizationsForUser(userId: string): Promise<Organization[]> {
    const memberships = await orgMemberRepository.getByUser(userId)
    if (memberships.length === 0) return []

    const orgIds = memberships.map((m) => m.organizationId)
    return organizationRepository.getByIds(orgIds)
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    return organizationRepository.getById(orgId)
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return organizationRepository.getBySlug(slug)
  }

  async getMembers(orgId: string): Promise<OrganizationMember[]> {
    return orgMemberRepository.getByOrganization(orgId)
  }

  async getMemberCount(orgId: string): Promise<number> {
    return orgMemberRepository.countByOrganization(orgId)
  }

  /**
   * Leave an organization. Owners may leave only if another owner exists.
   */
  async leaveOrganization(orgId: string, userId: string): Promise<void> {
    const member = await orgMemberRepository.getByOrgAndUser(orgId, userId)
    if (!member) throw new Error("You are not a member of this organization")

    if (normalizeOrgRole(member.role) === "owner") {
      const owners = await countOrgOwners(orgId)
      if (owners <= 1) {
        throw new Error(
          "You are the last owner. Promote another member to owner before leaving."
        )
      }
    }

    await orgMemberRepository.deleteByOrgAndUser(orgId, userId)
    await profileRepository.removeOrganizationId(userId, orgId)
  }

  /**
   * Delete an organization completely. Only owners can delete.
   * WARNING: This permanently deletes the organization and all associated data.
   */
  async deleteOrganization(orgId: string, requesterId: string): Promise<void> {
    if (!(await isOrgOwner(orgId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can delete the organization")
    }

    // Get all members to remove organization from their profiles
    const members = await orgMemberRepository.getByOrganization(orgId)
    
    // Remove organization from all member profiles
    for (const member of members) {
      await profileRepository.removeOrganizationId(member.userId, orgId)
    }

    // Delete all organization memberships
    for (const member of members) {
      await orgMemberRepository.deleteByOrgAndUser(orgId, member.userId)
    }

    // Delete the organization itself
    await organizationRepository.delete(orgId)
  }
}
