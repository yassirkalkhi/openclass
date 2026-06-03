import Link from "next/link"
import { getMyOrganizationsAction, enterOrganizationAction, createOrganizationAction } from "@/app/actions/organization"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JoinOrgForm } from "@/components/forms/join-org-form"
import { OrganizationHeaderZone } from "@/components/organizations/organization-header-zone"
import { EnterOrgButton } from "@/components/organizations/enter-org-button"
import { Building2, Settings2, ShieldCheck } from "lucide-react"
import { cookies } from "next/headers"
import { getLocaleFromCookieHeader } from "@/lib/i18n/cookies"
import { locales } from "@/lib/i18n/locales"
import { GlobalHeader } from "@/components/workspace/global-header"

export const dynamic = "force-dynamic"

export default async function OrganizationsPage() {
  const result = await getMyOrganizationsAction()
  const organizations = result.success && result.data ? result.data.organizations : []
  const memberships = result.success && result.data ? result.data.memberships : []

  const cookieStore = await cookies()
  const locale = getLocaleFromCookieHeader(cookieStore.toString())
  const t = locales[locale]

  return (
    <div className="min-h-svh bg-background">
      <GlobalHeader></GlobalHeader>

      <main className="max-w-4xl w-full mx-auto p-6 sm:p-8 space-y-6">
        <OrganizationHeaderZone
          count={organizations.length}
          createOrganizationAction={createOrganizationAction}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <JoinOrgForm />

          {organizations.map((org) => {
            const membership = memberships.find((m) => m.organizationId === org.id)
            const orgRole = membership ? normalizeOrgRole(membership.role) : "member"
            const isOwner = orgRole === "owner"

            return (
              <Card
                key={org.id}
                className="flex flex-col justify-between hover:border-muted-foreground/30 transition-all duration-200 bg-background shadow-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium tracking-tight">
                        {org.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <span className="capitalize">{org.type}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 font-medium text-foreground/70">
                          {isOwner && <ShieldCheck className="h-3 w-3 text-primary" />}
                          {isOwner ? t.organizations.owner : t.organizations.member}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex items-center justify-end gap-2 pt-3 pb-3 border-t border-muted/30 mt-auto bg-muted/5 px-6">
                  {isOwner && (
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 text-muted-foreground hover:text-foreground gap-1.5"
                      asChild
                    >
                      <Link href={`/organizations/${org.slug}/settings`}>
                        <Settings2 className="h-3.5 w-3.5" />
                        {t.settings.general}
                      </Link>
                    </Button>
                  )}
                  <EnterOrgButton orgId={org.id} />
                </CardContent>
              </Card>
            )
          })}
        </div>

        {organizations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed bg-muted/10 text-center animate-in fade-in duration-300">
            <Building2 className="h-8 w-8 text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-medium mb-1">{t.organizations.title}</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              {t.organizations.initDesc}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
