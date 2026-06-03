"use server"

import { ClassService } from "@/lib/services/class-service"
import { ClassRepository } from "@/lib/repositories/class-repository"
import { PermissionService } from "@/lib/services/permission-service"
import { actionError, getActionOrgId, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Class, ClassMember, ClassSettings } from "@/lib/types/database"

const classService = new ClassService()
const classRepository = new ClassRepository()
const permissionService = new PermissionService()
import { ProfileRepository } from "@/lib/repositories/profile-repository"
const profileRepository = new ProfileRepository()

export async function getOrgClassesAction(): Promise<ActionResult<Class[]>> {
  try {
    const orgId = await getActionOrgId()
    const userId = await getActionUserId()
    const classes = await classService.getAccessibleClassesForUser(orgId, userId)
    return { success: true, data: classes }
  } catch (e) {
    return actionError(e)
  }
}

export async function createClassAction(data: {
  name: string
  slug: string
  visibility: Class["visibility"]
  description?: string
}): Promise<ActionResult<Class>> {
  try {
    const orgId = await getActionOrgId()
    const userId = await getActionUserId()
    const cls = await classService.createClass(data, orgId, userId)
    return { success: true, data: cls }
  } catch (e) {
    return actionError(e)
  }
}

export async function joinClassAction(inviteCode: string): Promise<ActionResult<ClassMember>> {
  try {
    const userId = await getActionUserId()
    const member = await classService.joinByInviteCode(inviteCode, userId)
    return { success: true, data: member }
  } catch (e) {
    return actionError(e)
  }
}

export async function getClassBySlugAction(slug: string): Promise<
  ActionResult<{
    class: Class
    membership: ClassMember
    permissions: Awaited<ReturnType<PermissionService["getPermissions"]>>
    settings: ClassSettings | null
  }>
> {
  try {
    const orgId = await getActionOrgId()
    const userId = await getActionUserId()
    const cls = await classRepository.getBySlug(orgId, slug)
    if (!cls) return { success: false, error: "Class not found" }

    const membership = await permissionService.resolveMembership(cls.id, userId)
    if (!membership) {
      return { success: false, error: "You are not a member of this class" }
    }

    const permissions = await permissionService.getPermissions(cls.id, userId)
    const settings = await classService.getSettings(cls.id, userId)

    return {
      success: true,
      data: { class: cls, membership, permissions: permissions ?? [], settings },
    }
  } catch (e) {
    return actionError(e)
  }
}

export async function getClassMembersAction(classId: string): Promise<ActionResult<ClassMember[]>> {
  try {
    const userId = await getActionUserId()
    const members = await classService.getClassMembers(classId, userId)

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

export async function updateClassAction(
  classId: string,
  data: Partial<Pick<Class, "name" | "description" | "imageUrl" | "visibility">>
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await classService.updateClass(classId, data, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateClassSettingsAction(
  classId: string,
  data: Partial<Pick<ClassSettings, "allowStudentUploads" | "allowAIAccess">>
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await classService.updateSettings(classId, data, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateClassMemberRoleAction(
  classId: string,
  targetUserId: string,
  role: ClassMember["role"]
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await classService.updateMemberRole(classId, targetUserId, role, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function removeClassMemberAction(
  classId: string,
  targetUserId: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await classService.removeMember(classId, targetUserId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function regenerateClassInviteAction(classId: string): Promise<ActionResult<string>> {
  try {
    const userId = await getActionUserId()
    const code = await classService.regenerateInviteCode(classId, userId)
    return { success: true, data: code }
  } catch (e) {
    return actionError(e)
  }
}

export async function setClassPermissionOverrideAction(
  classId: string,
  role: ClassMember["role"],
  permissionKey: import("@/lib/types/database").Permission["key"],
  enabled: boolean
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await permissionService.setPermissionOverride(
      classId,
      userId,
      role,
      permissionKey,
      enabled
    )
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function clearClassPermissionOverridesAction(
  classId: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await permissionService.clearOverrides(classId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
