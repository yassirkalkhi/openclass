"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"
import type { ClassInvitationEnriched } from "@/lib/services/class-invitation-service"
import {
  acceptClassInvitationAction,
  rejectClassInvitationAction,
} from "@/app/actions/invitation"
import { UserAvatar, RoleBadge } from "@/components/workspace/user-avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

export function InvitationCard({
  invitation,
  onResolved,
  compact = false,
}: {
  invitation: ClassInvitationEnriched
  onResolved?: () => void
  compact?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  function handleAccept() {
    setError(null)
    startTransition(async () => {
      const result = await acceptClassInvitationAction(invitation.id)
      if (!result.success) { setError(result.error); return }
      onResolved?.()
      if (result.data?.classSlug) router.push(`/app/${result.data.classSlug}`)
      router.refresh()
    })
  }

  function handleReject() {
    setError(null)
    startTransition(async () => {
      const result = await rejectClassInvitationAction(invitation.id)
      if (!result.success) { setError(result.error); return }
      onResolved?.()
      router.refresh()
    })
  }

  return (
    <div className={cn("rounded-lg border bg-card transition-colors", compact ? "p-2.5" : "p-4")}>
      <div className="flex gap-3">
        <UserAvatar
          name={invitation.inviterProfile?.fullName}
          email={invitation.inviterProfile?.email}
          avatarUrl={invitation.inviterProfile?.avatarUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn("font-medium leading-snug", compact ? "text-xs" : "text-sm")}>
            {invitation.class?.name ?? t.classes.title}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-foreground/80">
              {invitation.inviterProfile?.fullName ?? invitation.inviterProfile?.email}
            </span>{" "}
            {t.invitations.invitedAs} <RoleBadge role={invitation.role} />
          </p>
          {invitation.message && (
            <p className="text-[11px] text-muted-foreground italic">&ldquo;{invitation.message}&rdquo;</p>
          )}
          {error && <p className="text-[11px] text-destructive">{error}</p>}
        </div>
      </div>
      <div className={cn("flex gap-2", compact ? "mt-2" : "mt-3")}>
        <Button size="sm" className="h-7 flex-1 text-xs gap-1" disabled={pending} onClick={handleAccept}>
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {t.invitations.accept}
        </Button>
        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs gap-1" disabled={pending} onClick={handleReject}>
          <X className="h-3 w-3" />
          {t.invitations.decline}
        </Button>
      </div>
      {!compact && invitation.class?.slug && (
        <Link
          href={`/app/${invitation.class.slug}`}
          className="mt-2 block text-[10px] text-muted-foreground hover:text-foreground"
        >
          {t.invitations.previewClass}
        </Link>
      )}
    </div>
  )
}
