"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Mail } from "lucide-react"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import { usePermission } from "@/hooks/use-permission"
import { getClassMembersAction } from "@/app/actions/class"
import {
  getClassPendingInvitationsAction,
  cancelClassInvitationAction,
} from "@/app/actions/invitation"
import type { ClassMember } from "@/lib/types/database"
import type { ClassInvitationEnriched } from "@/lib/services/class-invitation-service"
import { ClassMemberRow } from "@/components/workspace/class-member-row"
import { InviteMemberForm } from "@/components/workspace/invite-member-form"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n/context"

export function ClassMembersSettings() {
  const { classData } = useClass()
  const { user, isOrgOwner } = useAuth()
  const { t } = useI18n()
  const canManageRoles = usePermission("manage_roles")
  // Member management (invite/kick) is a teacher/owner-only action
  const canManage = isOrgOwner || canManageRoles

  const [members, setMembers] = useState<ClassMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<ClassInvitationEnriched[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      getClassMembersAction(classData.id),
      canManage
        ? getClassPendingInvitationsAction(classData.id)
        : Promise.resolve({ success: true as const, data: [] }),
    ]).then(([membersRes, invitesRes]) => {
      if (membersRes.success && membersRes.data) setMembers(membersRes.data)
      if (invitesRes.success && invitesRes.data) setPendingInvites(invitesRes.data)
      setLoading(false)
    })
  }, [classData.id, canManage])

  useEffect(() => { load() }, [load])

  const teachers = members.filter((m) => m.role === "teacher")
  const students = members.filter((m) => m.role === "student")

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{t.members.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {members.length} {t.classes.enrolled} · {classData.name}
        </p>
      </div>

      {canManage && <InviteMemberForm classId={classData.id} onSent={load} />}

      {canManage && pendingInvites.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            {t.members.pendingInvitations} ({pendingInvites.length})
          </div>
          <ul className="space-y-2">
            {pendingInvites.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2.5 bg-muted/10"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    name={inv.inviteeProfile?.fullName}
                    email={inv.inviteeProfile?.email}
                    avatarUrl={inv.inviteeProfile?.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {inv.inviteeProfile?.fullName ?? inv.inviteeProfile?.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {t.members.invitedAs} {inv.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="shrink-0 text-muted-foreground"
                  onClick={async () => {
                    await cancelClassInvitationAction(inv.id)
                    load()
                  }}
                >
                  {t.members.cancel}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <MemberSection
            title={t.members.teachers}
            emptyText={t.members.noTeachers}
            count={teachers.length}
            members={teachers}
            classId={classData.id}
            canManage={canManage}
            currentUserId={user?.id}
            onChanged={load}
          />
          <MemberSection
            title={t.members.students}
            emptyText={t.members.noStudents}
            count={students.length}
            members={students}
            classId={classData.id}
            canManage={canManage}
            currentUserId={user?.id}
            onChanged={load}
          />
        </>
      )}
    </div>
  )
}

function MemberSection({
  title,
  emptyText,
  count,
  members,
  classId,
  canManage,
  currentUserId,
  onChanged,
}: {
  title: string
  emptyText: string
  count: number
  members: ClassMember[]
  classId: string
  canManage: boolean
  currentUserId?: string
  onChanged: () => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium">
          {title}{" "}
          <span className="text-muted-foreground font-normal">({count})</span>
        </h2>
      </div>
      {members.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li key={m.id}>
              <ClassMemberRow
                member={m}
                classId={classId}
                canManage={canManage}
                currentUserId={currentUserId}
                onChanged={onChanged}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
