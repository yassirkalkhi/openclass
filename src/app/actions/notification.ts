"use server"

import { NotificationService } from "@/lib/services/notification-service"
import { actionError, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Notification } from "@/lib/types/database"

const notificationService = new NotificationService()

export async function getMyNotificationsAction(): Promise<ActionResult<Notification[]>> {
  try {
    const userId = await getActionUserId()
    const notifications = await notificationService.getNotifications(userId)
    return { success: true, data: notifications }
  } catch (e) {
    return actionError(e)
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await notificationService.markRead(id, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function getUnreadNotificationCountAction(): Promise<ActionResult<number>> {
  try {
    const userId = await getActionUserId()
    const count = await notificationService.getUnreadCount(userId)
    return { success: true, data: count }
  } catch (e) {
    return actionError(e)
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await notificationService.markAllRead(userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
