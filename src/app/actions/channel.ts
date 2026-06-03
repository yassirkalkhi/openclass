"use server"

import { ChannelService } from "@/lib/services/channel-service"
import { actionError, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Channel, ChannelCategory } from "@/lib/types/database"

const channelService = new ChannelService()

export async function getClassChannelsAction(classId: string): Promise<
  ActionResult<{ channels: Channel[]; categories: ChannelCategory[] }>
> {
  try {
    const userId = await getActionUserId()
    const channels = await channelService.getChannels(classId, userId)
    const categories = await channelService.getCategories(classId, userId)
    return { success: true, data: { channels, categories } }
  } catch (e) {
    return actionError(e)
  }
}

export async function createChannelAction(
  classId: string,
  data: Pick<Channel, "name" | "type"> & { description?: string; categoryId?: string }
): Promise<ActionResult<Channel>> {
  try {
    if (data.type !== "text" && data.type !== "video") {
      return { success: false, error: "Only text and video channels can be created" }
    }
    const userId = await getActionUserId()
    const channel = await channelService.createChannel({ classId, ...data }, userId)
    return { success: true, data: channel }
  } catch (e) {
    return actionError(e)
  }
}
