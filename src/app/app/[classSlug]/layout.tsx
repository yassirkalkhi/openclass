import { notFound } from "next/navigation"
import { ClassProvider } from "@/context/class-context"
import { ChannelSidebar } from "@/components/workspace/channel-sidebar"
import { RightPanel } from "@/components/workspace/right-panel"
import { loadClassBySlug, loadClassChannels } from "@/lib/workspace/load-data"
import { requireOrg } from "@/lib/session"

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ classSlug: string }>
}) {
  const { classSlug } = await params
  const classData = await loadClassBySlug(classSlug)
  if (!classData) notFound()

  const session = await requireOrg()
  const { channels, categories } = await loadClassChannels(classData.cls.id, session.id)

  return (
    <ClassProvider
      value={{
        classData: classData.cls,
        membership: classData.membership,
        permissions: classData.permissions,
        settings: classData.settings,
      }}
    >
      <ChannelSidebar classSlug={classSlug} channels={channels} categories={categories} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      <RightPanel />
    </ClassProvider>
  )
}
