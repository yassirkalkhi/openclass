"use client"

import { useState } from "react"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import { updateClassAction, updateClassSettingsAction } from "@/app/actions/class"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"

export default function ClassSettingsPage() {
  const { classData, settings } = useClass()
  const { isOrgOwner } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  const canManage = isOrgOwner
  const [name, setName] = useState(classData.name)
  const [allowStudentUploads, setAllowStudentUploads] = useState(settings?.allowStudentUploads ?? true)
  const [allowAIAccess, setAllowAIAccess] = useState(settings?.allowAIAccess ?? true)

  async function saveGeneral() {
    await updateClassAction(classData.id, { name })
    router.refresh()
  }

  async function saveSettings() {
    await updateClassSettingsAction(classData.id, { allowStudentUploads, allowAIAccess })
    router.refresh()
  }

  return (
    <div className="p-6 max-w-lg space-y-8">
      <section className="space-y-4">
        <h1 className="text-lg font-semibold">{t.classes.settingsTitle}</h1>
        <div className="space-y-2">
          <Label htmlFor="name">{t.classes.nameLabel}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canManage}
          />
        </div>
        {canManage && (
          <Button size="sm" onClick={saveGeneral}>{t.common.save}</Button>
        )}
      </section>

      {canManage && (
        <section className="space-y-4 border-t pt-6">
          <h2 className="font-medium">{t.classes.features}</h2>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allowStudentUploads}
              onChange={(e) => setAllowStudentUploads(e.target.checked)}
            />
            {t.classes.allowStudentUploads}
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allowAIAccess}
              onChange={(e) => setAllowAIAccess(e.target.checked)}
            />
            {t.classes.allowAIAssistant}
          </label>
          <Button size="sm" onClick={saveSettings}>{t.classes.saveFeatures}</Button>
        </section>
      )}
    </div>
  )
}
