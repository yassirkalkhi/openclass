"use client"

import { Suspense, memo, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hash, Megaphone, Video, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Channel, ChannelCategory } from "@/lib/types/database"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AIChannelSidebarItem } from "@/components/workspace/ai-channel-sidebar"
import { CreateChannelDialog } from "@/components/workspace/create-channel-dialog"
import { useTranslation } from "@/lib/i18n/context"

const channelIcons = {
  text: Hash,
  announcement: Megaphone,
  video: Video,
}

/** Returns a translated display name for the reserved fixed channels. */
function useChannelDisplayName(name: string): string {
  const { t } = useTranslation("channels")
  if (name === "general") return t.general
  if (name === "announcements") return t.announcements
  return name
}

const ChannelItem = memo(({
  channel,
  classSlug,
  isActive,
}: {
  channel: Channel
  classSlug: string
  isActive: boolean
}) => {
  const href = `/app/${classSlug}/channels/${channel.id}`
  const Icon = channelIcons[channel.type]
  const displayName = useChannelDisplayName(channel.name)
  return (
    <li>
      <Link
        href={href}
        prefetch={true}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{displayName}</span>
      </Link>
    </li>
  )
})

ChannelItem.displayName = "ChannelItem"

const NavLink = memo(({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) => {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "rounded-md px-2 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </Link>
  )
})

NavLink.displayName = "NavLink"

export const ChannelSidebar = memo(function ChannelSidebar({
  classSlug,
  channels,
  categories,
}: {
  classSlug: string
  channels: Channel[]
  categories: ChannelCategory[]
}) {
  const pathname = usePathname()
  const { classData, membership } = useClass()
  const { isOrgOwner } = useAuth()
  const { t: tClasses } = useTranslation("classes")
  // Channel management is a teacher/owner-only action — no longer a configurable permission
  const canManageChannels = isOrgOwner || membership.role === "teacher"

  const uncategorized = useMemo(
    () => channels.filter((c) => !c.categoryId),
    [channels]
  )

  const categorizedChannels = useMemo(
    () => categories.map((cat) => ({
      category: cat,
      channels: channels.filter((c) => c.categoryId === cat.id),
    })),
    [categories, channels]
  )

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="truncate text-sm font-semibold">{classData.name}</h2>
        <Button variant="ghost" size="icon-xs" asChild>
          <Link href={`/app/${classSlug}/settings`} title={tClasses.settings}>
            <Settings className="size-4" />
          </Link>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        <Section
          title={tClasses.channels}
          classSlug={classSlug}
          pathname={pathname}
          canAdd={canManageChannels}
          addChannelDialog={canManageChannels ? <CreateChannelDialog classSlug={classSlug} /> : undefined}
        >
          <Suspense fallback={null}>
            <AIChannelSidebarItem classSlug={classSlug} />
          </Suspense>
          {uncategorized.map((ch) => (
            <ChannelItem
              key={ch.id}
              channel={ch}
              classSlug={classSlug}
              isActive={pathname === `/app/${classSlug}/channels/${ch.id}`}
            />
          ))}
        </Section>
        {categorizedChannels.map(({ category, channels: catChannels }) => (
          <Section
            key={category.id}
            title={category.name}
            classSlug={classSlug}
            pathname={pathname}
            canAdd={false}
          >
            {catChannels.map((ch) => (
              <ChannelItem
                key={ch.id}
                channel={ch}
                classSlug={classSlug}
                isActive={pathname === `/app/${classSlug}/channels/${ch.id}`}
              />
            ))}
          </Section>
        ))}
      </nav>

      <div className="border-t p-2 flex flex-col gap-0.5">
        <NavLink href={`/app/${classSlug}/resources`} active={pathname.includes("/resources")}>
          {tClasses.resources}
        </NavLink>
        <NavLink
          href={`/app/${classSlug}/assignments`}
          active={pathname.includes("/assignments")}
        >
          {tClasses.assignments}
        </NavLink>
      </div>
    </aside>
  )
})

function Section({
  title,
  classSlug,
  pathname,
  canAdd,
  addChannelDialog,
  children,
}: {
  title: string
  classSlug: string
  pathname: string
  canAdd: boolean
  addChannelDialog?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between px-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        {canAdd && addChannelDialog}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </div>
  )
}
