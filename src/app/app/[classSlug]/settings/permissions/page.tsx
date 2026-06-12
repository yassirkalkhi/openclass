"use client"

import { useState, useTransition } from "react"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import {
  setClassPermissionOverrideAction,
  clearClassPermissionOverridesAction,
} from "@/app/actions/class"
import type { PermissionKey, ClassMember } from "@/lib/types/database"
import { DEFAULT_PERMISSIONS, ORG_OWNER_ONLY_PERMISSIONS } from "@/lib/permissions/defaults"
import { useRouter } from "next/navigation"
import {
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Users,
  GraduationCap,
  RotateCcw,
  MessageSquare,
  Video,
  Mic,
  Upload,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

 
type PermMeta = {
  label: string
  description: string
  icon: React.ElementType
}

const PERM_META: Partial<Record<PermissionKey, PermMeta>> = {
  send_messages: {
    label: "Send Messages",
    description: "Post messages in text channels",
    icon: MessageSquare,
  },
  upload_files: {
    label: "Upload Files",
    description: "Attach files and images to messages",
    icon: Upload,
  },
  join_voice: {
    label: "Join Voice",
    description: "Connect to voice channels",
    icon: Mic,
  },
  join_video: {
    label: "Join Video",
    description: "Join live video rooms",
    icon: Video,
  },
  use_ai: {
    label: "Use AI Assistant",
    description: "Access the class AI assistant",
    icon: Bot,
  },
}

 const EDITABLE_KEYS = Object.keys(PERM_META) as PermissionKey[]

const ROLE_CONFIG: Record<
  ClassMember["role"],
  { label: string; icon: React.ElementType; styles: string }
> = {
  teacher: {
    label: "Teacher",
    icon: GraduationCap,
    styles: "text-blue-500 bg-blue-500/10 border-blue-200/30",
  },
  student: {
    label: "Student",
    icon: Users,
    styles: "text-indigo-500 bg-indigo-500/10 border-indigo-200/30",
  },
}

const EDITABLE_ROLES: ClassMember["role"][] = ["teacher", "student"]

// ── Component ──────────────────────────────────────────────────────────────

export default function ClassPermissionsPage() {
  const { classData, settings } = useClass()
  const { isOrgOwner } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [updatingKey, setUpdatingKey] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  const overrides = settings?.permissionOverrides ?? {}

  const canEdit = isOrgOwner

  function effectiveValue(role: ClassMember["role"], key: PermissionKey): boolean {
    const roleOverrides = overrides[role]
    if (roleOverrides && key in roleOverrides) {
      return roleOverrides[key]!
    }
    return DEFAULT_PERMISSIONS[role][key] ?? false
  }

  function isOverridden(role: ClassMember["role"], key: PermissionKey): boolean {
    return overrides[role] != null && key in overrides[role]!
  }

  function handleToggle(role: ClassMember["role"], key: PermissionKey, enabled: boolean) {
    if (!canEdit) return
    const trackId = `${role}-${key}`
    setUpdatingKey(trackId)
    startTransition(async () => {
      try {
        await setClassPermissionOverrideAction(classData.id, role, key, enabled)
        router.refresh()
      } catch (err) {
        console.error("Failed to update permission override:", err)
      } finally {
        setUpdatingKey(null)
      }
    })
  }

  function handleReset() {
    setResetting(true)
    startTransition(async () => {
      try {
        await clearClassPermissionOverridesAction(classData.id)
        router.refresh()
      } catch (err) {
        console.error("Failed to clear overrides:", err)
      } finally {
        setResetting(false)
      }
    })
  }

  const hasAnyOverride = EDITABLE_ROLES.some(
    (role) => overrides[role] && Object.keys(overrides[role]!).length > 0
  )

  // ── Access guard ─────────────────────────────────────────────────────────
  if (!canEdit) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center p-6">
        <div className="flex flex-col items-center p-8 bg-background border rounded-2xl shadow-sm max-w-sm text-center gap-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-full">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-1">Access Restricted</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Only organization owners can configure permission overrides for this class.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-muted/30 text-foreground">
      {/* Header */}
      <div className="px-8 py-5 bg-background border-b flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">Permissions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Override default member action permissions for each role in this class.
            </p>
          </div>
        </div>

        {hasAnyOverride && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending} className="shrink-0">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset to defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all overrides?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all custom permission overrides and restore the built-in
                  defaults for every role in this class.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  disabled={resetting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {resetting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Reset"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid gap-8 max-w-4xl">
          {EDITABLE_ROLES.map((role) => {
            const roleMeta = ROLE_CONFIG[role]
            const RoleIcon = roleMeta.icon

            return (
              <section
                key={role}
                className="bg-background border border-border/80 shadow-sm rounded-xl overflow-hidden"
              >
                {/* Role header */}
                <div className="px-5 py-4 border-b bg-muted/10 flex items-center gap-3">
                  <div className={`p-2 border rounded-lg shrink-0 ${roleMeta.styles}`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight">{roleMeta.label}</h2>
                    <p className="text-[11px] text-muted-foreground">
                      Customise what members with this role can do in this class
                    </p>
                  </div>
                </div>

                {/* Permission rows */}
                <ul className="divide-y divide-border/60">
                  {EDITABLE_KEYS.map((key) => {
                    const meta = PERM_META[key]!
                    const PermIcon = meta.icon
                    const trackId = `${role}-${key}`
                    const isUpdating = updatingKey === trackId
                    const enabled = effectiveValue(role, key)
                    const overridden = isOverridden(role, key)

                    return (
                      <li
                        key={key}
                        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                          isUpdating
                            ? "bg-accent/30 opacity-70"
                            : "hover:bg-muted/30"
                        }`}
                      >
                        {/* Icon */}
                        <PermIcon className="w-4 h-4 text-muted-foreground shrink-0" />

                        {/* Label + description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {meta.label}
                            </span>
                            {overridden && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-200/40">
                                custom
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {meta.description}
                          </p>
                        </div>

                        {/* Toggle */}
                        <label className="relative inline-flex items-center gap-2.5 cursor-pointer select-none shrink-0">
                          <span
                            className={`text-xs font-medium transition-colors ${
                              enabled ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {enabled ? "Allowed" : "Denied"}
                          </span>

                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={enabled}
                              disabled={isPending}
                              onChange={(e) => handleToggle(role, key, e.target.checked)}
                            />
                            <div
                              className={`w-10 h-5.5 rounded-full border transition-colors peer-disabled:opacity-50 peer-disabled:cursor-not-allowed ${
                                enabled
                                  ? "bg-primary border-primary"
                                  : "bg-muted border-border"
                              }`}
                              style={{ height: "22px", width: "40px" }}
                              onClick={() => !isPending && handleToggle(role, key, !enabled)}
                              role="switch"
                              aria-checked={enabled}
                            >
                              <div
                                className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-background shadow-sm transition-transform ${
                                  enabled ? "translate-x-[19px]" : "translate-x-[1px]"
                                }`}
                              />
                            </div>

                            {isUpdating && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
