import { ClassMemberRepository } from "@/lib/repositories/class-member-repository"
import { ClassSettingsRepository } from "@/lib/repositories/class-settings-repository"
import { ClassRepository } from "@/lib/repositories/class-repository"
import {
  DEFAULT_PERMISSIONS,
  ORG_OWNER_ONLY_PERMISSIONS,
} from "@/lib/permissions/defaults"
import {
  isOrgOwnerForClass,
  syntheticOrgOwnerClassMember,
} from "@/lib/permissions/org-access"
import { normalizeClassRole } from "@/lib/permissions/normalize-roles"
import type { Permission, ClassMember, PermissionOverrides } from "@/lib/types/database"

const classMemberRepository = new ClassMemberRepository()
const classSettingsRepository = new ClassSettingsRepository()
const classRepository = new ClassRepository()

async function getOverrides(classId: string): Promise<PermissionOverrides | undefined> {
  const settings = await classSettingsRepository.getByClass(classId)
  return settings?.permissionOverrides
}

function resolvePermission(
  role: ClassMember["role"],
  permissionKey: Permission["key"],
  overrides?: PermissionOverrides
): boolean {
  const roleOverrides = overrides?.[role]
  if (roleOverrides && permissionKey in roleOverrides) {
    return roleOverrides[permissionKey]!
  }
  return DEFAULT_PERMISSIONS[role][permissionKey] ?? false
}

function allPermissionsEnabled(): Permission[] {
  const keys = Object.keys(DEFAULT_PERMISSIONS.teacher) as Permission["key"][]
  return keys.map((key) => ({ key, enabled: true }))
}

export class PermissionService {
  private async orgOwnerHas(
    classId: string,
    userId: string,
    permissionKey: Permission["key"]
  ): Promise<boolean> {
    if (!ORG_OWNER_ONLY_PERMISSIONS.includes(permissionKey)) return false
    return isOrgOwnerForClass(classId, userId)
  }

  async resolveMembership(
    classId: string,
    userId: string
  ): Promise<ClassMember | null> {
    const member = await classMemberRepository.getByClassAndUser(classId, userId)
    if (member) return member
    if (await isOrgOwnerForClass(classId, userId)) {
      return syntheticOrgOwnerClassMember(classId, userId)
    }
    return null
  }

  async hasPermission(
    classId: string,
    userId: string,
    permissionKey: Permission["key"]
  ): Promise<boolean> {
    const member = await classMemberRepository.getByClassAndUser(classId, userId)
    if (!member) {
      return isOrgOwnerForClass(classId, userId)
    }

    if (await this.orgOwnerHas(classId, userId, permissionKey)) return true

    const role = normalizeClassRole(member.role)
    const overrides = await getOverrides(classId)
    return resolvePermission(role, permissionKey, overrides)
  }

  async getPermissions(classId: string, userId: string): Promise<Permission[] | null> {
    const member = await classMemberRepository.getByClassAndUser(classId, userId)
    if (!member) {
      if (await isOrgOwnerForClass(classId, userId)) {
        return allPermissionsEnabled()
      }
      return null
    }

    const role = normalizeClassRole(member.role)
    const overrides = await getOverrides(classId)
    const keys = Object.keys(DEFAULT_PERMISSIONS.teacher) as Permission["key"][]

    const permissions = await Promise.all(
      keys.map(async (key) => ({
        key,
        enabled:
          (await this.orgOwnerHas(classId, userId, key)) ||
          resolvePermission(role, key, overrides),
      }))
    )
    return permissions
  }

  getDefaultPermissions(role: ClassMember["role"]): Permission[] {
    const defaults = DEFAULT_PERMISSIONS[role]
    return (Object.keys(defaults) as Permission["key"][]).map((key) => ({
      key,
      enabled: defaults[key],
    }))
  }

  async setPermissionOverride(
    classId: string,
    requesterId: string,
    role: ClassMember["role"],
    permissionKey: Permission["key"],
    enabled: boolean
  ): Promise<void> {
    if (!(await isOrgOwnerForClass(classId, requesterId))) {
      throw new Error("Forbidden: Only organization owners can modify permissions")
    }
    if (ORG_OWNER_ONLY_PERMISSIONS.includes(permissionKey)) {
      throw new Error("Organization owner permissions cannot be overridden per class")
    }

    const settings = await classSettingsRepository.getByClass(classId)
    if (!settings) throw new Error("Class settings not found")

    const overrides: PermissionOverrides = {
      ...settings.permissionOverrides,
      [role]: {
        ...settings.permissionOverrides?.[role],
        [permissionKey]: enabled,
      },
    }

    await classSettingsRepository.update(settings.id, { permissionOverrides: overrides })
  }

  async clearOverrides(classId: string, requesterId: string): Promise<void> {
    if (!(await isOrgOwnerForClass(classId, requesterId))) {
      throw new Error("Forbidden")
    }

    const settings = await classSettingsRepository.getByClass(classId)
    if (!settings) return
    await classSettingsRepository.update(settings.id, { permissionOverrides: {} })
  }

  async requirePermission(
    classId: string,
    userId: string,
    permissionKey: Permission["key"]
  ): Promise<void> {
    const allowed = await this.hasPermission(classId, userId, permissionKey)
    if (!allowed) {
      throw new Error(
        `Forbidden: You do not have the '${permissionKey}' permission in this class`
      )
    }
  }

  async requireMembership(classId: string, userId: string): Promise<ClassMember> {
    const membership = await this.resolveMembership(classId, userId)
    if (!membership) {
      throw new Error("Forbidden: You are not a member of this class")
    }
    return membership
  }

  async requireRole(
    classId: string,
    userId: string,
    minimumRole: ClassMember["role"]
  ): Promise<ClassMember> {
    const member = await this.requireMembership(classId, userId)
    if (minimumRole === "teacher" && (await isOrgOwnerForClass(classId, userId))) {
      return member
    }

    const role = normalizeClassRole(member.role)
    const hierarchy: Record<ClassMember["role"], number> = {
      teacher: 2,
      student: 1,
    }
    if (hierarchy[role] < hierarchy[minimumRole]) {
      throw new Error(`Forbidden: Requires '${minimumRole}' role or higher`)
    }
    return member
  }
}
