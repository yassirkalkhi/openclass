"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CreateOrgForm } from "@/components/forms/create-org-form"
import { Plus, X } from "lucide-react"
import type { Organization } from "@/lib/types/database"
import { useI18n } from "@/lib/i18n/context"

interface OrganizationHeaderZoneProps {
  count: number
  createOrganizationAction: (data: {
    name: string
    slug: string
    type: Organization["type"]
    visibility: Organization["visibility"]
    description?: string
  }) => Promise<{ success: boolean; error?: string }>
}

export function OrganizationHeaderZone({ count, createOrganizationAction }: OrganizationHeaderZoneProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-border/60">
        <h2 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
          {t.organizations.title} ({count})
        </h2>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          variant={isOpen ? "secondary" : "outline"}
          className="h-8 w-8 transition-colors duration-200"
          title={t.organizations.createNew}
        >
          {isOpen ? (
            <X className="h-4 w-4 text-foreground animate-in spin-in-90 duration-200" />
          ) : (
            <Plus className="h-4 w-4 animate-in fade-in duration-200" />
          )}
          <span className="sr-only">{t.organizations.createNew}</span>
        </Button>
      </div>

      <CreateOrgForm
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        createOrganizationAction={createOrganizationAction}
      />
    </div>
  )
}
