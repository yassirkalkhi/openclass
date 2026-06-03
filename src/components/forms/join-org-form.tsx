"use client"

import { useState } from "react"
import { joinOrganizationAction } from "@/app/actions/organization"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"

export function JoinOrgForm() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const { t } = useI18n()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const code = new FormData(e.currentTarget).get("inviteCode") as string
    const result = await joinOrganizationAction(code.trim())
    setPending(false)
    if (!result.success) { setError(result.error); return }
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t.organizations.joinWithCode}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="inviteCode">{t.organizations.inviteCodeLabel}</Label>
            <Input
              id="inviteCode"
              name="inviteCode"
              required
              placeholder={t.organizations.inviteCodePlaceholder}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? t.common.loading : t.organizations.joinBtn}
          </Button>
        </form>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
