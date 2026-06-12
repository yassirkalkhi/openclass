import { ClassInvitationRepository } from "@/lib/repositories/class-invitation-repository"
import { ClassMemberRepository } from "@/lib/repositories/class-member-repository"
import { ClassRepository } from "@/lib/repositories/class-repository"
import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { NotificationRepository } from "@/lib/repositories/notification-repository"
import { PermissionService } from "@/lib/services/permission-service"
import { NotificationService } from "@/lib/services/notification-service"
import { generateId } from "@/lib/utils"
import type { ClassInvitation, ClassMember, Profile, Class } from "@/lib/types/database"

const invitationRepository = new ClassInvitationRepository()
const classMemberRepository = new ClassMemberRepository()
const classRepository = new ClassRepository()
const orgMemberRepository = new OrganizationMemberRepository()
const profileRepository = new ProfileRepository()
const notificationRepository = new NotificationRepository()
const permissionService = new PermissionService()
const notificationService = new NotificationService()
export type ClassInvitationEnriched = ClassInvitation & {
  class?: Class
  inviterProfile?: Profile
  inviteeProfile?: Profile
}

export class ClassInvitationService {
  private async requireCanInvite(classId: string, userId: string): Promise<Class> {
    const cls = await classRepository.getById(classId)
    if (!cls) throw new Error("Class not found")
     await permissionService.requireRole(classId, userId, "teacher")
    return cls
  }

  async createInvitation(
    classId: string,
    inviteeUserId: string,
    role: ClassMember["role"],
    inviterId: string,
    message?: string
  ): Promise<ClassInvitation> {
    const cls = await this.requireCanInvite(classId, inviterId)

    if (inviteeUserId === inviterId) {
      throw new Error("You cannot invite yourself")
    }

    const orgMember = await orgMemberRepository.getByOrgAndUser(
      cls.organizationId,
      inviteeUserId
    )
    if (!orgMember) {
      throw new Error("User must be a member of the organization before joining this class")
    }

    const existingMember = await classMemberRepository.getByClassAndUser(
      classId,
      inviteeUserId
    )
    if (existingMember) {
      throw new Error("User is already a member of this class")
    }

    const pending = await invitationRepository.getPendingForClassAndInvitee(
      classId,
      inviteeUserId
    )
    if (pending) {
      throw new Error("A pending invitation already exists for this user")
    }

    const inviterProfile = await profileRepository.getById(inviterId)
    const now = new Date().toISOString()

    const invitation: ClassInvitation = {
      id: generateId(),
      classId,
      organizationId: cls.organizationId,
      inviteeUserId,
      inviterUserId: inviterId,
      role,
      status: "pending",
      message,
      createdAt: now,
    }
    await invitationRepository.create(invitation)

    const inviterName = inviterProfile?.fullName ?? inviterProfile?.email ?? "Someone"
    await notificationService.createNotification({
      userId: inviteeUserId,
      type: "invite",
      title: `Class invitation: ${cls.name}`,
      content: `${inviterName} invited you to join as ${role}.${message ? ` "${message}"` : ""}`,
      invitationId: invitation.id,
      classId: cls.id,
    })

    return invitation
  }

  async getPendingForUser(userId: string): Promise<ClassInvitationEnriched[]> {
    const invitations = await invitationRepository.getPendingByInvitee(userId)
    return this.enrichInvitations(invitations)
  }

  async getPendingForClass(
    classId: string,
    requesterId: string
  ): Promise<ClassInvitationEnriched[]> {
    await this.requireCanInvite(classId, requesterId)
    const invitations = await invitationRepository.getPendingByClass(classId)
    return this.enrichInvitations(invitations)
  }

  async getInviteCandidates(
    classId: string,
    requesterId: string,
    query: string
  ): Promise<Profile[]> {
    const cls = await this.requireCanInvite(classId, requesterId)
    const orgMembers = await orgMemberRepository.getByOrganization(cls.organizationId)
    const classMembers = await classMemberRepository.getByClass(classId)
    const memberIds = new Set(classMembers.map((m) => m.userId))
    const pending = await invitationRepository.getPendingByClass(classId)
    const pendingIds = new Set(pending.map((p) => p.inviteeUserId))

    const candidateIds = orgMembers
      .map((m) => m.userId)
      .filter((id) => id !== requesterId && !memberIds.has(id) && !pendingIds.has(id))

    if (candidateIds.length === 0) return []

    const profiles = await profileRepository.getByIds(candidateIds)
    const q = query.trim().toLowerCase()
    if (!q) return profiles.slice(0, 20)

    return profiles
      .filter((p) => {
        const name = (p.fullName ?? "").toLowerCase()
        const email = p.email.toLowerCase()
        return name.includes(q) || email.includes(q)
      })
      .slice(0, 20)
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<ClassMember> {
    const invitation = await invitationRepository.getById(invitationId)
    if (!invitation) throw new Error("Invitation not found")
    if (invitation.inviteeUserId !== userId) {
      throw new Error("Forbidden: This invitation is not for you")
    }
    if (invitation.status !== "pending") {
      throw new Error("This invitation is no longer pending")
    }

    const existingMember = await classMemberRepository.getByClassAndUser(
      invitation.classId,
      userId
    )
    if (existingMember) {
      await invitationRepository.update(invitation.id, {
        status: "accepted",
        respondedAt: new Date().toISOString(),
      })
      await this.resolveInviteNotifications(invitation.id, userId)
      return existingMember
    }

    const membership: ClassMember = {
      id: generateId(),
      classId: invitation.classId,
      userId,
      role: invitation.role,
      joinedAt: new Date().toISOString(),
    }
    await classMemberRepository.create(membership)

    await invitationRepository.update(invitation.id, {
      status: "accepted",
      respondedAt: new Date().toISOString(),
    })

    await this.resolveInviteNotifications(invitation.id, userId)
    return membership
  }

  async rejectInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await invitationRepository.getById(invitationId)
    if (!invitation) throw new Error("Invitation not found")
    if (invitation.inviteeUserId !== userId) {
      throw new Error("Forbidden: This invitation is not for you")
    }
    if (invitation.status !== "pending") {
      throw new Error("This invitation is no longer pending")
    }

    await invitationRepository.update(invitation.id, {
      status: "rejected",
      respondedAt: new Date().toISOString(),
    })
    await this.resolveInviteNotifications(invitation.id, userId)
  }

  async cancelInvitation(invitationId: string, requesterId: string): Promise<void> {
    const invitation = await invitationRepository.getById(invitationId)
    if (!invitation) throw new Error("Invitation not found")
    await this.requireCanInvite(invitation.classId, requesterId)

    if (invitation.status !== "pending") {
      throw new Error("Only pending invitations can be cancelled")
    }

    await invitationRepository.update(invitation.id, {
      status: "cancelled",
      respondedAt: new Date().toISOString(),
    })

    const notifications = await notificationRepository.getByUser(invitation.inviteeUserId)
    for (const n of notifications) {
      if (n.invitationId === invitation.id && !n.read) {
        await notificationRepository.markRead(n.id)
      }
    }
  }

  private async resolveInviteNotifications(
    invitationId: string,
    userId: string
  ): Promise<void> {
    const notifications = await notificationRepository.getByUser(userId)
    for (const n of notifications) {
      if (n.invitationId === invitationId && !n.read) {
        await notificationRepository.markRead(n.id)
      }
    }
  }

  private async enrichInvitations(
    invitations: ClassInvitation[]
  ): Promise<ClassInvitationEnriched[]> {
    if (invitations.length === 0) return []

    const classIds = [...new Set(invitations.map((i) => i.classId))]
    const userIds = [
      ...new Set(invitations.flatMap((i) => [i.inviterUserId, i.inviteeUserId])),
    ]

    const classes = await classRepository.getByIds(classIds)
    const profiles = await profileRepository.getByIds(userIds)
    const classMap = new Map(classes.map((c) => [c.id, c]))
    const profileMap = new Map(profiles.map((p) => [p.id, p]))

    return invitations.map((inv) => ({
      ...inv,
      class: classMap.get(inv.classId),
      inviterProfile: profileMap.get(inv.inviterUserId),
      inviteeProfile: profileMap.get(inv.inviteeUserId),
    }))
  }

  async getPendingInviteCount(userId: string): Promise<number> {
    const pending = await invitationRepository.getPendingByInvitee(userId)
    return pending.length
  }
}
