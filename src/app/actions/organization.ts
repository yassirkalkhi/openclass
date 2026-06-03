"use server"

import { OrganizationService } from "@/lib/services/organization-service"
import { AuthService } from "@/lib/services/auth-service"
import { actionError, getActionOrgId, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import { requireSession } from "@/lib/session"
import { redirect } from "next/navigation"
import type { Organization, OrganizationMember } from "@/lib/types/database"
import { revalidatePath } from "next/cache"

const organizationService = new OrganizationService()
const authService = new AuthService()

export async function getMyOrganizationsAction(): Promise<
  ActionResult<{ organizations: Organization[]; memberships: OrganizationMember[] }>
> {
  try {
    const userId = await getActionUserId()
    const organizations = await organizationService.getOrganizationsForUser(userId)
    const { OrganizationMemberRepository } = await import(
      "@/lib/repositories/organization-member-repository"
    )
    const memberships = await new OrganizationMemberRepository().getByUser(userId)
    return { success: true, data: { organizations, memberships } }
  } catch (e) {
    return actionError(e)
  }
}

export async function createOrganizationAction(data: {
  name: string
  slug: string
  type: Organization["type"]
  visibility: Organization["visibility"]
  description?: string
}): Promise<ActionResult<Organization>> {
  try {
    const userId = await getActionUserId()
    const org = await organizationService.createOrganization(data, userId)
    await authService.switchOrganization(userId, org.id)
    return { success: true, data: org }
  } catch (e) {
    return actionError(e)
  }
}

export async function joinOrganizationAction(inviteCode: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await organizationService.joinByInviteCode(inviteCode, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function enterOrganizationAction(orgId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await authService.switchOrganization(userId, orgId)
    revalidatePath("/", "layout")
  } catch (e) {
    return actionError(e)
  }
  redirect("/app")
}

export async function getOrganizationBySlugAction(
  slug: string
): Promise<ActionResult<Organization>> {
  try {
    const org = await organizationService.getOrganizationBySlug(slug)
    if (!org) return { success: false, error: "Organization not found" }
    return { success: true, data: org }
  } catch (e) {
    return actionError(e)
  }
}

export async function getOrgMembersAction(
  orgId: string
): Promise<ActionResult<OrganizationMember[]>> {
  try {
    const userId = await getActionUserId()
    const members = await organizationService.getMembers(orgId)
    const requester = members.find((m) => m.userId === userId)
    if (!requester) return { success: false, error: "Forbidden" }

    // Enrich members with profile data
    const profileRepo = await import("@/lib/repositories/profile-repository")
    const profileRepository = new profileRepo.ProfileRepository()
    const userIds = Array.from(new Set(members.map((m) => m.userId)))
    const profiles = await profileRepository.getByIds(userIds)
    const profileMap = new Map(profiles.map((p) => [p.id, p]))

    const enrichedMembers = members.map((m) => ({
      ...m,
      profile: profileMap.get(m.userId),
    }))

    return { success: true, data: enrichedMembers }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateOrganizationAction(
  orgId: string,
  data: Partial<Pick<Organization, "name" | "description" | "visibility">>
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await organizationService.updateOrganization(orgId, data, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function regenerateOrgInviteAction(orgId: string): Promise<ActionResult<string>> {
  try {
    const userId = await getActionUserId()
    const code = await organizationService.regenerateInviteCode(orgId, userId)
    return { success: true, data: code }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateOrgMemberRoleAction(
  orgId: string,
  targetUserId: string,
  role: OrganizationMember["role"]
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await organizationService.updateMemberRole(orgId, targetUserId, role, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function removeOrgMemberAction(
  orgId: string,
  targetUserId: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await organizationService.removeMember(orgId, targetUserId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function getActiveOrganizationAction(): Promise<ActionResult<Organization | null>> {
  try {
    const orgId = await getActionOrgId()
    const org = await organizationService.getOrganization(orgId)
    return { success: true, data: org }
  } catch (e) {
    return actionError(e)
  }
}

export async function deleteOrganizationAction(orgId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await organizationService.deleteOrganization(orgId, userId)
    revalidatePath("/", "layout")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
