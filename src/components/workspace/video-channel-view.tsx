"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Lock, Video, PhoneOff, Loader2, Radio, WifiOff } from "lucide-react"
import type { Channel } from "@/lib/types/database"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import { useOrganization } from "@/context/organization-context"
import { usePermission } from "@/hooks/use-permission"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  getVideoRoomStatusAction,
  startVideoSessionAction,
  getVideoJoinCredentialsAction,
  endVideoSessionAction,
} from "@/app/actions/video-room"
import { useI18n } from "@/lib/i18n/context"

const LiveKitConference = dynamic(
  () => import("@/components/workspace/livekit-conference").then((m) => m.LiveKitConference),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[360px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

type JoinPhase = "idle" | "joined"
type LiveKitCredentials = { serverUrl: string; roomName: string; token: string }

export function VideoChannelView({ channel, classSlug }: { channel: Channel; classSlug: string }) {
  const { membership } = useClass()
  const { isOrgOwner } = useAuth()
   const canManage = isOrgOwner || membership.role === "teacher"
  const canJoin = usePermission("join_video")
  const { organization } = useOrganization()
  const { t } = useI18n()

  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<JoinPhase>("idle")
  const [credentials, setCredentials] = useState<LiveKitCredentials | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const joined = phase === "joined"

  const loadStatus = useCallback(() => {
    getVideoRoomStatusAction(channel.id).then((r) => {
      if (r.success && r.data) setActive(r.data.active)
    })
  }, [channel.id])

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 8000)
    return () => clearInterval(interval)
  }, [loadStatus])

  async function handleStartSession() {
    setError(null)
    setBusy(true)
    try {
      const result = await startVideoSessionAction(channel.id, classSlug)
      if (!result.success) { setError(result.error); return }
      setActive(true)
    } finally { setBusy(false) }
  }

  async function handleJoin() {
    setError(null)
    setBusy(true)
    try {
      const result = await getVideoJoinCredentialsAction(channel.id)
      if (!result.success) { setError(result.error); return }
      if (!result.data) { setError(t.video.couldNotGetCredentials); return }
      setCredentials({ serverUrl: result.data.serverUrl, roomName: result.data.roomName, token: result.data.token })
      setPhase("joined")
    } finally { setBusy(false) }
  }

  function handleLeave() { setPhase("idle"); setCredentials(null) }

  async function handleEndSession() {
    setError(null)
    setBusy(true)
    try {
      handleLeave()
      const result = await endVideoSessionAction(channel.id)
      if (!result.success) { setError(result.error); return }
      setActive(false)
    } finally { setBusy(false) }
  }

   if (!organization?.videoFeatureEnabled) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Video className="size-5" />
              <span className="text-muted-foreground font-semibold">#</span>
              <h1 className="truncate text-lg font-semibold tracking-tight">{channel.name}</h1>
            </div>
            {channel.description && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{channel.description}</p>
            )}
          </div>
          <Badge variant="outline" className="p-2 text-[12px]">
            <Lock className="size-3 mr-1" />
            {t.video.locked}
          </Badge>
        </div>
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm mx-auto">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold tracking-tight mb-2">{t.video.premiumFeature}</h2>
            <p className="text-sm text-muted-foreground mb-5">{t.video.premiumDesc}</p>
            <Button asChild size="sm">
              <Link href="/app/billing">{t.video.upgradePlan}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Video className="size-5" />
            <span className="text-muted-foreground font-semibold">#</span>
            <h1 className="truncate text-lg font-semibold tracking-tight">{channel.name}</h1>
          </div>
          {channel.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{channel.description}</p>
          )}
        </div>
        {active ? (
          <Badge variant="secondary" className="gap-1 text-[12px]">
            <Radio className="size-6 text-red-500 animate-pulse" />
            {t.video.live}
          </Badge>
        ) : (
          <Badge variant="outline" className="p-2 text-[12px]">
            <WifiOff size={8} />
            {t.video.offline}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col min-h-0 p-4 gap-3">
        {!joined && (
          <div className="flex flex-wrap items-center gap-2">
            {canManage && !active && (
              <Button size="sm" onClick={handleStartSession} disabled={busy}>
                {busy ? <Loader2 className="size-5 animate-spin" /> : <Video className="size-5" />}
                {t.video.startSession}
              </Button>
            )}
            {active && canJoin && (
              <Button size="sm" onClick={handleJoin} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
                {t.video.joinVideo}
              </Button>
            )}
            {canManage && active && (
              <Button size="sm" variant="outline" onClick={handleEndSession} disabled={busy}>
                <PhoneOff className="size-4" />
                {t.video.endSession}
              </Button>
            )}
          </div>
        )}

        {joined && canManage && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleLeave}>{t.video.leaveCall}</Button>
            <Button size="sm" variant="outline" onClick={handleEndSession} disabled={busy}>
              <PhoneOff className="size-4" />
              {t.video.endSessionForClass}
            </Button>
          </div>
        )}

        {canManage && active && !joined && (
          <p className="text-xs text-muted-foreground">{t.video.sessionNote}</p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {joined && credentials ? (
          <div className="flex-1 min-h-[360px] rounded-lg border overflow-hidden bg-muted/20">
            <LiveKitConference
              serverUrl={credentials.serverUrl}
              token={credentials.token}
              onDisconnected={handleLeave}
            />
          </div>
        ) : (
          !active && (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
              <p className="text-sm text-muted-foreground text-center max-w-sm px-4">
                {canManage ? t.video.noSession : t.video.noSessionStudent}
              </p>
            </div>
          )
        )}

        {!joined && active && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/10">
            <p className="text-sm text-muted-foreground">{t.video.clickToJoin}</p>
          </div>
        )}
      </div>
    </div>
  )
}
