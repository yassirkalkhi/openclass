"use server"

import { VideoRoomService } from "@/lib/services/video-room-service"
import { actionError, getActionUserId, getActionOrgId, type ActionResult } from "@/lib/actions/utils"
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"
import { makeBillingError } from "@/lib/billing/errors"
import type { VideoRoom } from "@/lib/types/database"

const videoRoomService = new VideoRoomService()

export async function getVideoRoomStatusAction(
  channelId: string
): Promise<ActionResult<VideoRoom | null>> {
  try {
    const userId = await getActionUserId()
    const room = await videoRoomService.getRoomForChannel(channelId, userId)
    return { success: true, data: room }
  } catch (e) {
    return actionError(e)
  }
}

export async function startVideoSessionAction(
  channelId: string,
  classSlug: string
): Promise<ActionResult<VideoRoom>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Check video feature access
    const { hasAccess, reason } = await BillingMiddleware.requireVideoAccess(orgId)
    if (!hasAccess) {
      return { success: false, error: makeBillingError(reason || "Video feature not available") }
    }

    const room = await videoRoomService.startSession(channelId, userId, classSlug)
    return { success: true, data: room }
  } catch (e) {
    return actionError(e)
  }
}

export async function getVideoJoinCredentialsAction(channelId: string): Promise<
  ActionResult<{
    serverUrl: string
    roomName: string
    token: string
    active: boolean
  }>
> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Check video feature access
    const { hasAccess, reason } = await BillingMiddleware.requireVideoAccess(orgId)
    if (!hasAccess) {
      return { success: false, error: makeBillingError(reason || "Video feature not available") }
    }

    const credentials = await videoRoomService.getJoinCredentials(channelId, userId)
    return { success: true, data: credentials }
  } catch (e) {
    return actionError(e)
  }
}

export async function endVideoSessionAction(channelId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await videoRoomService.endSession(channelId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
