"use server"

import { ClassInvitationService } from "@/lib/services/class-invitation-service"
import {
  actionError,
  getActionUserId,
  type ActionResult,
} from "@/lib/actions/utils"
import type { ClassMember, Profile } from "@/lib/types/database"
import type {
  ClassInvitationEnriched,
} from "@/lib/services/class-invitation-service"
import { revalidatePath } from "next/cache"

const invitationService = new ClassInvitationService()

export async function getMyPendingInvitationsAction(): Promise<
  ActionResult<ClassInvitationEnriched[]>
> {
  try {
    const userId = await getActionUserId()
    const invitations = await invitationService.getPendingForUser(userId)
    return { success: true, data: invitations }
  } catch (e) {
    return actionError(e)
  }
}

export async function getClassPendingInvitationsAction(
  classId: string
): Promise<ActionResult<ClassInvitationEnriched[]>> {
  try {
    const userId = await getActionUserId()
    const invitations = await invitationService.getPendingForClass(classId, userId)
    return { success: true, data: invitations }
  } catch (e) {
    return actionError(e)
  }
}

export async function searchClassInviteCandidatesAction(
  classId: string,
  query: string
): Promise<ActionResult<Profile[]>> {
  try {
    const userId = await getActionUserId()
    const profiles = await invitationService.getInviteCandidates(classId, userId, query)
    return { success: true, data: profiles }
  } catch (e) {
    return actionError(e)
  }
}

export async function sendClassInvitationAction(
  classId: string,
  inviteeUserId: string,
  role: ClassMember["role"],
  message?: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await invitationService.createInvitation(
      classId,
      inviteeUserId,
      role,
      userId,
      message
    )
    revalidatePath("/app", "layout")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function acceptClassInvitationAction(
  invitationId: string
): Promise<ActionResult<{ classSlug?: string }>> {
  try {
    const userId = await getActionUserId()
    const membership = await invitationService.acceptInvitation(invitationId, userId)
    const { ClassRepository } = await import("@/lib/repositories/class-repository")
    const cls = await new ClassRepository().getById(membership.classId)
    revalidatePath("/app", "layout")
    return { success: true, data: { classSlug: cls?.slug } }
  } catch (e) {
    return actionError(e)
  }
}

export async function rejectClassInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await invitationService.rejectInvitation(invitationId, userId)
    revalidatePath("/app", "layout")
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function cancelClassInvitationAction(
  invitationId: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await invitationService.cancelInvitation(invitationId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function getPendingInvitationCountAction(): Promise<ActionResult<number>> {
  try {
    const userId = await getActionUserId()
    const count = await invitationService.getPendingInviteCount(userId)
    return { success: true, data: count }
  } catch (e) {
    return actionError(e)
  }
}
