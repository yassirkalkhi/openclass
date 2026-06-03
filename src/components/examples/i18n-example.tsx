"use client"

import { useTranslation } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

/**
 * Example component showing how to use translations
 */
export function I18nExample() {
  const { t: common } = useTranslation("common")
  const { t: nav } = useTranslation("nav")
  const { t: auth } = useTranslation("auth")

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">{common.loading}</h2>
      
      <div className="space-x-2">
        <Button>{common.save}</Button>
        <Button variant="outline">{common.cancel}</Button>
        <Button variant="destructive">{common.delete}</Button>
      </div>

      <div className="space-y-2">
        <p>{nav.home}</p>
        <p>{nav.classes}</p>
        <p>{nav.organizations}</p>
      </div>

      <div className="space-y-2">
        <p>{auth.login}</p>
        <p>{auth.register}</p>
        <p>{auth.email}</p>
      </div>
    </div>
  )
}
