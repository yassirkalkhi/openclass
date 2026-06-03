import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { OrganizationService } from "@/lib/services/organization-service"
import { OrganizationMemberRepository } from "@/lib/repositories/organization-member-repository"
import { requireSession } from "@/lib/session"
import { OrgSettingsClient } from "@/components/organizations/org-settings-client"
import { normalizeOrgRole } from "@/lib/permissions/normalize-roles"
import { getOrgMembersAction } from "@/app/actions/organization"
import { GlobalHeader } from "@/components/workspace/global-header"

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const session = await requireSession()
  const orgService = new OrganizationService()
  const org = await orgService.getOrganizationBySlug(orgSlug)
  if (!org) notFound()

  const memberRepo = new OrganizationMemberRepository()
  const membership = await memberRepo.getByOrgAndUser(org.id, session.id)
  if (!membership || normalizeOrgRole(membership.role) !== "owner") {
    redirect("/organizations")
  }

  const membersResult = await getOrgMembersAction(org.id)
  const members = membersResult.success && membersResult.data ? membersResult.data : []

  return (
    <div className="min-h-svh bg-muted/30">
      <GlobalHeader></GlobalHeader>
      <main className="mx-auto max-w-2xl p-6">
        <OrgSettingsClient organization={org} members={members} />
      </main>
    </div>
  )
}
