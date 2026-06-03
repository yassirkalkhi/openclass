"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { enterOrganizationAction } from "@/app/actions/organization"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface EnterOrgButtonProps {
  orgId: string
}

export function EnterOrgButton({ orgId }: EnterOrgButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { t } = useI18n()

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await enterOrganizationAction(orgId)
      if (!result.success) { setError(result.error); return }
      router.push("/app")
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button" variant="outline" size="sm"
        className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            {t.common.next}
            <ArrowRight className="h-3 w-3 opacity-60" />
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
