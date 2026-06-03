"use client"

import { useState, useTransition } from "react"
import { GraduationCap, User, UserMinus, Loader2 } from "lucide-react"
import type { ClassMember } from "@/lib/types/database"
import {
  updateClassMemberRoleAction,
  removeClassMemberAction,
} from "@/app/actions/class"
import { UserAvatar, RoleBadge } from "@/components/workspace/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

export function ClassMemberRow({
  member,
  classId,
  canManage,
  currentUserId,
  onChanged,
}: {
  member: ClassMember
  classId: string
  canManage: boolean
  currentUserId?: string
  onChanged: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const isSelf = member.userId === currentUserId
  const { t } = useI18n()

  function setRole(role: ClassMember["role"]) {
    if (member.role === role) return
    startTransition(async () => {
      await updateClassMemberRoleAction(classId, member.userId, role)
      onChanged()
    })
  }

  function remove() {
    startTransition(async () => {
      await removeClassMemberAction(classId, member.userId)
      setConfirmRemove(false)
      onChanged()
    })
  }

  return (
    <>
      <div className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-border/80 hover:bg-muted/20">
        <UserAvatar
          name={member.profile?.fullName}
          email={member.profile?.email}
          avatarUrl={member.profile?.avatarUrl}
          size="default"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {member.profile?.fullName ?? t.members.unknownUser}
          </p>
          <p className="truncate text-xs text-muted-foreground">{member.profile?.email}</p>
        </div>

        {canManage && !isSelf ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex rounded-md border bg-muted/30 p-0.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => setRole("teacher")}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all",
                  member.role === "teacher"
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {pending && member.role !== "teacher" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <GraduationCap className="h-3 w-3" />
                )}
                {t.members.teacher}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setRole("student")}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all",
                  member.role === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-3 w-3" />
                {t.members.student}
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => setConfirmRemove(true)}
              className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-opacity"
              title={t.members.remove}
            >
              <UserMinus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>

      <Dialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.members.removeMember}</DialogTitle>
            <DialogDescription>
              {t.members.removeMemberDesc.replace(
                "{{name}}",
                member.profile?.fullName ?? member.profile?.email ?? ""
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmRemove(false)}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" size="sm" disabled={pending} onClick={remove}>
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : t.members.remove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
