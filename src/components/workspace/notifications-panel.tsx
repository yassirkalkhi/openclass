"use client"

import { useCallback, useEffect, useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import {
  getMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notification"
import type { Notification } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

const TYPE_ICON: Record<Notification["type"], string> = {
  announcement: "📣",
  message: "💬",
  mention: "@",
  invite: "✉️",
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const { t } = useI18n()

  const load = useCallback(() => {
    setLoading(true)
    getMyNotificationsAction().then((r) => {
      if (r.success && r.data) setNotifications(r.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDismiss(id: string) {
    await markNotificationReadAction(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  async function handleMarkAllRead() {
    setMarking(true)
    await markAllNotificationsReadAction()
    setNotifications([])
    setMarking(false)
  }

  const unread = notifications.filter((n) => !n.read)

  return (
    <div className="flex flex-col h-full">
      {unread.length > 0 && (
        <div className="flex items-center justify-end px-1 pb-1 shrink-0">
          <Button
            variant="ghost"
            size="xs"
            className="h-6 gap-1 text-[11px] text-muted-foreground"
            onClick={handleMarkAllRead}
            disabled={marking}
          >
            <CheckCheck className="h-3 w-3" />
            {t.notifications.markAllRead}
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 p-1">
          {loading && (
            <p className="text-xs text-muted-foreground p-2">
              {t.notifications.loadingNotifications}
            </p>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{t.notifications.noNotifications}</p>
              <p className="text-xs text-muted-foreground/70">{t.notifications.noNotificationsDesc}</p>
            </div>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "rounded-lg border p-2.5 text-xs transition-colors",
                !n.read ? "bg-muted/40 border-border" : "bg-background border-transparent opacity-60"
              )}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-sm leading-none shrink-0">
                  {TYPE_ICON[n.type] ?? "🔔"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("font-medium leading-snug", !n.read && "text-foreground")}>
                    {n.title}
                  </p>
                  {n.content && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-3 leading-relaxed">
                      {n.content}
                    </p>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleDismiss(n.id)}
                    className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-1"
                    aria-label={t.common.dismiss}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
