"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkspaceUI } from "@/context/workspace-ui-context"
import { useClass } from "@/context/class-context"
import { getClassMembersAction } from "@/app/actions/class"
import { getPendingInvitationCountAction } from "@/app/actions/invitation"
import type { ClassMember } from "@/lib/types/database"
import { UserAvatar, RoleBadge } from "@/components/workspace/user-avatar"
import { InvitationsPanel } from "@/components/workspace/invitations-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

const POLL_INTERVAL_MS = 30_000

export function RightPanel() {
  const { rightPanelTab, setRightPanelTab, rightPanelOpen } = useWorkspaceUI()
  const { classData } = useClass()
  const { t } = useI18n()

  const [members, setMembers] = useState<ClassMember[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [inviteCount, setInviteCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const requestIdRef = useRef(0)

  const fetchMembers = useCallback(async (classId: string, silent = false) => {
    const requestId = ++requestIdRef.current
    try {
      if (!silent) setMembersLoading(true)
      else setRefreshing(true)
      const r = await getClassMembersAction(classId)
      if (requestId !== requestIdRef.current) return
      if (r.success && r.data) setMembers(r.data)
    } catch (error) {
      console.error("Failed to fetch members:", error)
    } finally {
      if (requestId === requestIdRef.current) {
        setMembersLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  const fetchInviteCount = useCallback(async () => {
    try {
      const r = await getPendingInvitationCountAction()
      if (r.success && r.data !== undefined) setInviteCount(r.data)
    } catch (error) {
      console.error("Failed to fetch invitation count:", error)
    }
  }, [])

  useEffect(() => {
    setMembersLoading(true)
    fetchMembers(classData.id, false)
    fetchInviteCount()
    const interval = setInterval(() => {
      fetchMembers(classData.id, true)
      fetchInviteCount()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [classData.id, fetchMembers, fetchInviteCount])

  if (!rightPanelOpen) {
    return null
  }

  return (
    <aside className={cn("flex w-72 shrink-0 flex-col border-l bg-background")}>
      <Tabs
        value={rightPanelTab}
        onValueChange={(v) => setRightPanelTab(v as typeof rightPanelTab)}
        className="flex h-full flex-col"
      >
        <TabsList className="m-2 grid w-[calc(100%-1rem)] grid-cols-2">
          <TabsTrigger value="members" className="px-1 text-xs">
            {t.classes.members}
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-1 px-1 text-xs">
            {t.nav.invitations}
            {inviteCount > 0 && (
              <Badge variant="default" className="h-4 min-w-4 px-1 text-[9px]">
                {inviteCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-0 flex-1 px-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-1 pb-1 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {membersLoading && members.length === 0
                ? ""
                : members.length === 1
                  ? t.members.membersCount.replace("{{count}}", String(members.length))
                  : t.members.membersCountPlural.replace("{{count}}", String(members.length))}
            </span>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {membersLoading && members.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-4 animate-spin shrink-0 text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {t.members.noMembersFound}
              </div>
            ) : (
              <ul className="space-y-1.5 p-1">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/40"
                  >
                    <UserAvatar
                      name={m.profile?.fullName}
                      email={m.profile?.email}
                      avatarUrl={m.profile?.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1 flex flex-col">
                      <span className="truncate text-xs font-semibold text-foreground">
                        {m.profile?.fullName || m.userId.slice(0, 8)}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {m.profile?.email || t.common.noEmail}
                      </span>
                    </div>
                    <RoleBadge role={m.role} />
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="invitations" className="mt-0 px-2 flex-1 overflow-hidden">
          <InvitationsPanel />
        </TabsContent>
      </Tabs>
    </aside>
  )
}
