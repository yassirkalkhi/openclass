"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Organization } from "@/lib/types/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"

interface CreateOrgFormProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  createOrganizationAction: (data: {
    name: string
    slug: string
    type: Organization["type"]
    visibility: Organization["visibility"]
    description?: string
  }) => Promise<{ success: boolean; error?: string }>
}

export function CreateOrgForm({ isOpen, setIsOpen, createOrganizationAction }: CreateOrgFormProps) {
  const router = useRouter()
  const { t } = useI18n()
  const [isPending, startTransition] = React.useTransition()
  const [state, setState] = React.useState<{ success?: boolean; error?: string | null }>({})
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [type, setType] = React.useState<any>("school")

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({})
    startTransition(async () => {
      try {
        const res = await createOrganizationAction({ name, slug, type, visibility: "private", description: "" })
        if (res?.success) {
          setState({ success: true })
          setName("")
          setSlug("")
          setTimeout(() => { setIsOpen(false); setState({}); router.refresh() }, 1000)
        } else {
          setState({ error: res?.error || t.errors.failedToBuild })
        }
      } catch {
        setState({ error: t.errors.unexpectedError })
      }
    })
  }

  return (
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"}`}>
      <div className="overflow-hidden">
        <Card className="bg-background shadow-sm border border-primary/10 ring-1 ring-primary/5">
          <CardHeader className="pb-3 relative">
            <Button
              type="button" variant="ghost" size="icon"
              className="absolute right-3 top-3 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => { setIsOpen(false); setState({}) }}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-base font-medium tracking-tight flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              {t.organizations.createNew}
            </CardTitle>
            <CardDescription className="text-xs">{t.organizations.initDesc}</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pb-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="org-name" className="text-xs font-semibold text-muted-foreground">
                    {t.organizations.nameLabel}
                  </Label>
                  <Input
                    id="org-name" required
                    placeholder="Acme Academy"
                    value={name}
                    onChange={handleNameChange}
                    disabled={isPending || state.success}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="org-slug" className="text-xs font-semibold text-muted-foreground">
                    {t.organizations.slugLabel}
                  </Label>
                  <Input
                    id="org-slug" required
                    placeholder="acme-academy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={isPending || state.success}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="org-type" className="text-xs font-semibold text-muted-foreground">
                    {t.organizations.typeLabel}
                  </Label>
                  <Select value={type} onValueChange={setType} disabled={isPending || state.success}>
                    <SelectTrigger id="org-type" className="h-9 text-sm capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">{t.organizations.school}</SelectItem>
                      <SelectItem value="company">{t.organizations.company}</SelectItem>
                      <SelectItem value="club">{t.organizations.club}</SelectItem>
                      <SelectItem value="other">{t.organizations.other}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {state.error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 border border-destructive/10 p-2.5 rounded-md animate-in fade-in duration-200">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <p className="font-medium">{state.error}</p>
                </div>
              )}

              {state.success && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-md dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <p className="font-medium">{t.common.success}</p>
                </div>
              )}
            </CardContent>

            <div className="flex items-center justify-end gap-2 py-3 border-t border-muted/40 bg-muted/5 px-6">
              <Button
                type="button" variant="ghost" size="sm" className="h-8 text-xs"
                onClick={() => setIsOpen(false)}
                disabled={isPending || state.success}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit" size="sm" className="h-8 font-medium text-xs shadow-none"
                disabled={isPending || state.success}
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" />{t.organizations.creating}</>
                ) : (
                  t.organizations.createBtn
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
