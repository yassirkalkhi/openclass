import type { ClassMember, Permission } from "@/lib/types/database"

export const DEFAULT_PERMISSIONS: Record<
  ClassMember["role"],
  Record<Permission["key"], boolean>
> = {
  teacher: {
    manage_organization: false,
    manage_class: false,
    manage_roles: false,
    send_messages: true,
    upload_files: true,
    join_voice: true,
    join_video: true,
    use_ai: true,
  },
  student: {
    manage_organization: false,
    manage_class: false,
    manage_roles: false,
    send_messages: true,
    upload_files: true,
    join_voice: true,
    join_video: true,
    use_ai: true,
  },
}

/** Permissions granted only to organization owners (not class roles). */
export const ORG_OWNER_ONLY_PERMISSIONS: Permission["key"][] = [
  "manage_organization",
  "manage_class",
  "manage_roles",
]

export function getDefaultPermissionsList(role: ClassMember["role"]): Permission[] {
  const defaults = DEFAULT_PERMISSIONS[role]
  return (Object.keys(defaults) as Permission["key"][]).map((key) => ({
    key,
    enabled: defaults[key],
  }))
}
