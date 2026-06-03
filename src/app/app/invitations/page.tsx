"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { getMyPendingInvitationsAction } from "@/app/actions/invitation"
import type { ClassInvitationEnriched } from "@/lib/services/class-invitation-service"
import { InvitationCard } from "@/components/workspace/invitation-card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

export default function InvitationsPage() {
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b px-6 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/app"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            {t.invitations.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.invitations.titleDesc}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-lg space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">{t.invitations.loadingInvitations}</p>
          )}
          {!loading && invitations.length === 0 && (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <Mail className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">{t.invitations.noPending}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.invitations.noPendingDesc}</p>
            </div>
          )}
          {invitations.map((inv) => (
            <InvitationCard key={inv.id} invitation={inv} onResolved={load} />
          ))}
        </div>
      </div>
    </div>
  )
}
