import { WorkspaceEmptyState } from "@/components/workspace/empty-states"
import { loadWorkspaceShellData } from "@/lib/workspace/load-data"
import { redirect } from "next/navigation"

export default async function AppHomePage() {
  const { classes } = await loadWorkspaceShellData()
  if (classes.length > 0) {
    redirect(`/app/${classes[0].slug}`)
  }
  return <WorkspaceEmptyState />
}
