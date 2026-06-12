"use server"

import { ClassService } from "@/lib/services/class-service"
import { ChannelService } from "@/lib/services/channel-service"
import { AssignmentService } from "@/lib/services/assignment-service"
import { ResourceService } from "@/lib/services/resource-service"
import { actionError, getActionOrgId, getActionUserId, type ActionResult } from "@/lib/actions/utils"

const classService = new ClassService()
const channelService = new ChannelService()
const assignmentService = new AssignmentService()
const resourceService = new ResourceService()

export type SearchResultItem = {
  id: string
  type: "class" | "channel" | "assignment" | "resource"
  title: string
  subtitle: string
  href: string
  /** For channel/assignment/resource  */
  classSlug?: string
}

export type SearchResults = {
  items: SearchResultItem[]
  total: number
}

 
export async function searchAction(query: string): Promise<ActionResult<SearchResults>> {
  if (!query || query.trim().length < 2) {
    return { success: true, data: { items: [], total: 0 } }
  }

  try {
    const [orgId, userId] = await Promise.all([getActionOrgId(), getActionUserId()])
    const q = query.trim().toLowerCase()

     const classes = await classService.getAccessibleClassesForUser(orgId, userId)

    const items: SearchResultItem[] = []

     for (const cls of classes) {
      if (
        cls.name.toLowerCase().includes(q) ||
        cls.description?.toLowerCase().includes(q) ||
        cls.slug.toLowerCase().includes(q)
      ) {
        items.push({
          id: cls.id,
          type: "class",
          title: cls.name,
          subtitle: cls.description ?? cls.slug,
          href: `/app/${cls.slug}`,
        })
      }
    }

     await Promise.all(
      classes.map(async (cls) => {
        const [channelResult, assignmentResult, resourceResult] = await Promise.allSettled([
          channelService.getChannels(cls.id, userId),
          assignmentService.getAssignmentsForClass(cls.id, userId),
          resourceService.getResourcesForClass(cls.id, userId),
        ])

        if (channelResult.status === "fulfilled") {
          for (const ch of channelResult.value) {
            if (
              ch.name.toLowerCase().includes(q) ||
              ch.description?.toLowerCase().includes(q)
            ) {
              items.push({
                id: ch.id,
                type: "channel",
                title: ch.name,
                subtitle: ch.description ?? cls.name,
                href: `/app/${cls.slug}/channels/${ch.id}`,
                classSlug: cls.slug,
              })
            }
          }
        }

        if (assignmentResult.status === "fulfilled") {
          for (const a of assignmentResult.value) {
            if (
              a.title.toLowerCase().includes(q) ||
              a.description?.toLowerCase().includes(q)
            ) {
              items.push({
                id: a.id,
                type: "assignment",
                title: a.title,
                subtitle: a.dueDate
                  ? `Due ${new Date(a.dueDate).toLocaleDateString()} · ${cls.name}`
                  : cls.name,
                href: `/app/${cls.slug}/assignments/${a.id}`,
                classSlug: cls.slug,
              })
            }
          }
        }

        if (resourceResult.status === "fulfilled") {
          for (const r of resourceResult.value) {
            if (
              r.title.toLowerCase().includes(q) ||
              r.description?.toLowerCase().includes(q) ||
              r.tags?.some((tag) => tag.toLowerCase().includes(q))
            ) {
              items.push({
                id: r.id,
                type: "resource",
                title: r.title,
                subtitle: r.description ?? cls.name,
                href: `/app/${cls.slug}/resources`,
                classSlug: cls.slug,
              })
            }
          }
        }
      })
    )

    return { success: true, data: { items, total: items.length } }
  } catch (e) {
    return actionError(e)
  }
}
