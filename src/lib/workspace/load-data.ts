import { requireOrg } from "@/lib/session"
import { OrganizationService } from "@/lib/services/organization-service"
import { ClassService } from "@/lib/services/class-service"
import { ClassRepository } from "@/lib/repositories/class-repository"
import { ChannelRepository } from "@/lib/repositories/channel-repository"

const organizationService = new OrganizationService()
const classService = new ClassService()
const classRepository = new ClassRepository()
const channelRepository = new ChannelRepository()

export async function loadWorkspaceShellData() {
  try {
    const session = await requireOrg()
    const orgId = session.activeOrganizationId
    const organization = await organizationService.getOrganization(orgId)
    const classes = await classService.getAccessibleClassesForUser(orgId, session.id)

    return { session, organization, classes }
  } catch (error) {
    console.error("[loadWorkspaceShellData] Failed to load workspace data:", error)
    throw error
  }
}

export async function loadClassBySlug(slug: string) {
  const session = await requireOrg()
  const orgId = session.activeOrganizationId
  const cls = await classRepository.getBySlug(orgId, slug)
  if (!cls) return null

  const { PermissionService } = await import("@/lib/services/permission-service")

  const permissionService = new PermissionService()

  const membership = await permissionService.resolveMembership(cls.id, session.id)
  if (!membership) return null

  const permissions = await permissionService.getPermissions(cls.id, session.id)
  const settings = await classService.getSettings(cls.id, session.id)

  return { cls, membership, permissions: permissions ?? [], settings }
}

export async function loadClassChannels(classId: string, userId: string) {
  const { ChannelService } = await import("@/lib/services/channel-service")
  const channelService = new ChannelService()
  const channels = await channelService.getChannels(classId, userId)
  const categories = await channelService.getCategories(classId, userId)
  return { channels, categories }
}

export async function loadChannel(channelId: string) {
  return channelRepository.getById(channelId)
}
