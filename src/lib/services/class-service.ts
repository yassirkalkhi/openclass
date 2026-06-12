import { ClassRepository } from "@/lib/repositories/class-repository"
import { ClassMemberRepository } from "@/lib/repositories/class-member-repository"
import { ClassSettingsRepository } from "@/lib/repositories/class-settings-repository"
import { ChannelRepository } from "@/lib/repositories/channel-repository"
import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { PermissionService } from "./permission-service"
import { isOrgOwner } from "@/lib/permissions/org-access"
import { generateId } from "@/lib/utils"
import type {
  Class,
  ClassMember,
  ClassSettings,
  Channel,
} from "@/lib/types/database"

const classRepository = new ClassRepository()
const classMemberRepository = new ClassMemberRepository()
const classSettingsRepository = new ClassSettingsRepository()
const channelRepository = new ChannelRepository()
const orgMemberRepository = new OrganizationMemberRepository()
const permissionService = new PermissionService()

export class ClassService {
   
  async createClass(
    data: Pick<Class, "name" | "slug" | "visibility"> & {
      description?: string
      imageUrl?: string
    },
    organizationId: string,
    ownerId: string
  ): Promise<Class> {
    if (!(await isOrgOwner(organizationId, ownerId))) {
      throw new Error("Forbidden: Only organization owners can create classes")
    }

     const existingSlug = await classRepository.getBySlug(organizationId, data.slug)
    if (existingSlug) {
      throw new Error("A class with this slug already exists in this organization")
    }

    const now = new Date().toISOString()
    const classId = generateId()
    const inviteCode = generateId().slice(0, 8).toUpperCase()

    const newClass: Class = {
      id: classId,
      organizationId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      imageUrl: data.imageUrl,
      inviteCode,
      ownerId,
      visibility: data.visibility,
      archived: false,
      createdAt: now,
      updatedAt: now,
    }
    await classRepository.create(newClass)

    const membership: ClassMember = {
      id: generateId(),
      classId,
      userId: ownerId,
      role: "teacher",
      joinedAt: now,
    }
    await classMemberRepository.create(membership)

    // Create default channels
    const defaultChannels: Channel[] = [
      {
        id: generateId(),
        classId,
        name: "general",
        description: "General discussion",
        type: "text",
        position: 0,
        createdBy: ownerId,
        createdAt: now,
      },
      {
        id: generateId(),
        classId,
        name: "announcements",
        description: "Class announcements",
        type: "announcement",
        position: 1,
        createdBy: ownerId,
        createdAt: now,
      },
    ]
    await channelRepository.batchCreate(defaultChannels)

    // Create default settings
    const settings: ClassSettings = {
      id: generateId(),
      classId,
      allowStudentUploads: true,
      allowAIAccess: true,
      createdAt: now,
    }
    await classSettingsRepository.create(settings)

    return newClass
  }

  
  async joinByInviteCode(
    code: string,
    userId: string,
    role: ClassMember["role"] = "student"
  ): Promise<ClassMember> {
    const cls = await classRepository.getByInviteCode(code)
    if (!cls) {
      throw new Error("Invalid invite code")
    }

    // Check if already a member
    const existingMember = await classMemberRepository.getByClassAndUser(cls.id, userId)
    if (existingMember) {
      throw new Error("You are already a member of this class")
    }

     const orgMember = await orgMemberRepository.getByOrgAndUser(cls.organizationId, userId)
    if (!orgMember) {
      throw new Error("You must be a member of the organization to join this class")
    }

    const membership: ClassMember = {
      id: generateId(),
      classId: cls.id,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    }
    await classMemberRepository.create(membership)

    return membership
  }

 
  async updateClass(
    classId: string,
    data: Partial<Pick<Class, "name" | "description" | "imageUrl" | "visibility">>,
    requesterId: string
  ): Promise<void> {
    await permissionService.requirePermission(classId, requesterId, "manage_class")

    await classRepository.update(classId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

 
  async archiveClass(classId: string, requesterId: string): Promise<void> {
    await permissionService.requirePermission(classId, requesterId, "manage_class")

    await classRepository.update(classId, {
      archived: true,
      updatedAt: new Date().toISOString(),
    })
  }

  
  async unarchiveClass(classId: string, requesterId: string): Promise<void> {
    await permissionService.requirePermission(classId, requesterId, "manage_class")

    await classRepository.update(classId, {
      archived: false,
      updatedAt: new Date().toISOString(),
    })
  }

 
  async getClassesForUser(userId: string): Promise<Class[]> {
    const memberships = await classMemberRepository.getByUser(userId)
    if (memberships.length === 0) return []

    const classIds = memberships.map((m) => m.classId)
    return classRepository.getByIds(classIds)
  }
 
  async getClassesForOrganization(organizationId: string): Promise<Class[]> {
    return classRepository.getByOrganization(organizationId)
  }

 
  async getAccessibleClassesForUser(
    organizationId: string,
    userId: string
  ): Promise<Class[]> {
    if (await isOrgOwner(organizationId, userId)) {
      const all = await classRepository.getByOrganization(organizationId)
      return all.filter((c) => !c.archived)
    }
    const userClasses = await this.getClassesForUser(userId)
    return userClasses.filter(
      (c) => c.organizationId === organizationId && !c.archived
    )
  }

 
  async getClass(classId: string, userId: string): Promise<Class | null> {
    await permissionService.requireMembership(classId, userId)
    return classRepository.getById(classId)
  }
 
  async getClassMembers(classId: string, userId: string): Promise<ClassMember[]> {
    await permissionService.requireMembership(classId, userId)
    return classMemberRepository.getByClass(classId)
  }

 
  async removeMember(
    classId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    await permissionService.requireRole(classId, requesterId, "teacher")

    if (targetUserId === requesterId) {
      throw new Error("Cannot remove yourself. Use leaveClass instead.")
    }

    await classMemberRepository.deleteByClassAndUser(classId, targetUserId)
  }

  
  async leaveClass(classId: string, userId: string): Promise<void> {
    const member = await classMemberRepository.getByClassAndUser(classId, userId)
    if (!member) throw new Error("You are not a member of this class")

    await classMemberRepository.deleteByClassAndUser(classId, userId)
  }

   
  async updateMemberRole(
    classId: string,
    targetUserId: string,
    newRole: ClassMember["role"],
    requesterId: string
  ): Promise<void> {
    await permissionService.requirePermission(classId, requesterId, "manage_roles")

    const targetMember = await classMemberRepository.getByClassAndUser(classId, targetUserId)
    if (!targetMember) throw new Error("Member not found")

    if (newRole !== "teacher" && newRole !== "student") {
      throw new Error("Invalid class role")
    }

    await classMemberRepository.update(targetMember.id, { role: newRole })
  }

   
  async regenerateInviteCode(classId: string, requesterId: string): Promise<string> {
    await permissionService.requirePermission(classId, requesterId, "manage_class")

    const newCode = generateId().slice(0, 8).toUpperCase()
    await classRepository.update(classId, {
      inviteCode: newCode,
      updatedAt: new Date().toISOString(),
    })
    return newCode
  }

 
  async getSettings(classId: string, userId: string): Promise<ClassSettings | null> {
    await permissionService.requireMembership(classId, userId)
    return classSettingsRepository.getByClass(classId)
  }
 
  async updateSettings(
    classId: string,
    data: Partial<Pick<ClassSettings, "allowStudentUploads" | "allowAIAccess">>,
    requesterId: string
  ): Promise<void> {
    await permissionService.requirePermission(classId, requesterId, "manage_class")

    const settings = await classSettingsRepository.getByClass(classId)
    if (!settings) throw new Error("Class settings not found")

    await classSettingsRepository.update(settings.id, data)
  }
 
  async getMemberCount(classId: string): Promise<number> {
    return classMemberRepository.countByClass(classId)
  }
}
