"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Mail } from "lucide-react"
import { useWorkspaceUI } from "@/context/workspace-ui-context"
import { getMyNotificationsAction, markNotificationReadAction } from "@/app/actions/notification"
import {
  getMyPendingInvitationsAction,
  getPendingInvitationCountAction,
} from "@/app/actions/invitation"
import type { Notification } from "@/lib/types/database"
import type { ClassInvitationEnriched } from "@/lib/services/class-invitation-service"
import { InvitationCard } from "@/components/workspace/invitation-card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/lib/i18n/context"

export function HeaderAlertsMenu() {
  const router = useRouter()
  const { setRightPanelOpen, setRightPanelTab } = useWorkspaceUI()
  const { t } = useI18n()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invitations, setInvitations] = useState<ClassInvitationEnriched[]>([])
  const [badgeCount, setBadgeCount] = useState(0)

  const load = useCallback(() => {
    Promise.all([
      getMyNotificationsAction(),
      getMyPendingInvitationsAction(),
      getPendingInvitationCountAction(),
    ]).then(([nRes, iRes, countRes]) => {
      if (nRes.success && nRes.data) setNotifications(nRes.data.filter((n) => !n.read).slice(0, 8))
      if (iRes.success && iRes.data) setInvitations(iRes.data.slice(0, 3))
      if (countRes.success && countRes.data !== undefined) {
        const unreadNotifs = nRes.success && nRes.data ? nRes.data.filter((n) => !n.read).length : 0
        setBadgeCount(Math.max(unreadNotifs, countRes.data))
      }
    })
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  function openPanel(tab: "invitations" | "notifications") {
    setRightPanelTab(tab)
    setRightPanelOpen(true)
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && load()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {badgeCount > 0 && (
            <Badge
              variant="default"
              className="absolute -right-0.5 -top-0.5 size-4 min-w-4 justify-center rounded-full p-0 text-[9px]"
            >
              {badgeCount > 9 ? "9+" : badgeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between">
            <span>{t.invitations.alertsTitle}</span>
            {badgeCount > 0 && (
              <span className="text-xs text-muted-foreground">{badgeCount} {t.invitations.pending}</span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="max-h-72">
          {invitations.length > 0 && (
            <div className="space-y-2 px-2 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
                {t.invitations.invitationsSection}
              </p>
              {invitations.map((inv) => (
                <InvitationCard key={inv.id} invitation={inv} compact onResolved={load} />
              ))}
            </div>
          )}

          {notifications
            .filter((n) => n.type !== "invite" || !n.invitationId)
            .map((n) => (
              <div key={n.id} className="mx-2 mb-2 rounded-md border p-2 text-xs">
                <p className="font-medium">{n.title}</p>
                {n.content && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2">{n.content}</p>
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  className="mt-1 h-6"
                  onClick={async () => { await markNotificationReadAction(n.id); load() }}
                >
                  {t.common.dismiss}
                </Button>
              </div>
            ))}

          {invitations.length === 0 && notifications.filter((n) => n.type !== "invite").length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-4 text-center">
              {t.invitations.allCaughtUp}
            </p>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openPanel("invitations")}>
          <Mail className="size-4" />
          {t.invitations.openInvitationsPanel}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/app/invitations")}>
          {t.invitations.viewAllInvitations}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openPanel("notifications")}>
          <Bell className="size-4" />
          {t.invitations.openAlertsPanel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
