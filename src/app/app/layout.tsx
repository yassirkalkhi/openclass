import { redirect } from "next/navigation"
import { GlobalHeader } from "@/components/workspace/global-header"
import { ClassRail } from "@/components/workspace/class-rail"
import { loadWorkspaceShellData } from "@/lib/workspace/load-data"
import { OrganizationUpdater } from "@/components/workspace/organization-updater"

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let data
  try {
    data = await loadWorkspaceShellData()
  } catch {
    redirect("/organizations")
  }

  if (!data.organization) {
    redirect("/organizations")
  }

  return (
    <>
      <OrganizationUpdater organization={data.organization} />
      <div className="flex h-svh flex-col overflow-hidden">
        <GlobalHeader />
        <div className="flex min-h-0 flex-1">
          <ClassRail classes={data.classes} />
          {children}
        </div>
      </div>
    </>
  )
}
