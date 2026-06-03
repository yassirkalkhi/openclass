"use client"

import { useI18n } from "@/lib/i18n/context"

export function WorkspaceEmptyState() {
  const { t } = useI18n()
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center p-8">
      <h2 className="text-lg font-semibold">{t.classes.selectClass}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {t.classes.selectClassDesc}
      </p>
    </div>
  )
}
