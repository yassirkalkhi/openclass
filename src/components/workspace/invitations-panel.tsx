"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { getMyPendingInvitationsAction } from "@/app/actions/invitation"
import type { ClassInvitationEnriched } from "@/lib/services/class-invitation-service"
import { InvitationCard } from "@/components/workspace/invitation-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/lib/i18n/context"

export function InvitationsPanel({ showViewAll = true }: { showViewAll?: boolean }) {
  const [invitations, setInvitations] = useState<ClassInvitationEnriched[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useI18n()

  const load = useCallback(() => {
    setLoading(true)
    getMyPendingInvitationsAction().then((r) => {
      if (r.success && r.data) setInvitations(r.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-3 p-1">
        {showViewAll && (
          <div className="flex items-center justify-between px-1 pb-1">
            <p className="text-[11px] text-muted-foreground">{t.invitations.invitationsSection}</p>
            <Button variant="link" size="xs" className="h-auto p-0 text-[11px]" asChild>
              <Link href="/app/invitations">{t.common.all}</Link>
            </Button>
          </div>
        )}

        {loading && (
          <p className="text-xs text-muted-foreground p-2">{t.common.loading}</p>
        )}

        {!loading && invitations.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Mail className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t.invitations.noPending}</p>
          </div>
        )}

        {invitations.map((inv) => (
          <InvitationCard key={inv.id} invitation={inv} compact onResolved={load} />
        ))}
      </div>
    </ScrollArea>
  )
}
