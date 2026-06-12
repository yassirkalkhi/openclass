import { NotificationRepository } from "@/lib/repositories/notification-repository"
import { ClassMemberRepository } from "@/lib/repositories/class-member-repository"
import { generateId } from "@/lib/utils"
import type { Notification } from "@/lib/types/database"

const notificationRepository = new NotificationRepository()
const classMemberRepository = new ClassMemberRepository()

export class NotificationService {
 
  async createNotification(
    data: Pick<Notification, "userId" | "type" | "title"> & {
      content?: string
      invitationId?: string
      classId?: string
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: generateId(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      invitationId: data.invitationId,
      classId: data.classId,
      read: false,
      createdAt: new Date().toISOString(),
    }
    await notificationRepository.create(notification)

    return notification
  }

 
  async notifyClassMembers(
    classId: string,
    data: Pick<Notification, "type" | "title"> & {
      content?: string
    },
    excludeUserId?: string
  ): Promise<void> {
    const members = await classMemberRepository.getByClass(classId)
    const now = new Date().toISOString()

    const notifications: Notification[] = members
      .filter((m) => m.userId !== excludeUserId)
      .map((member) => ({
        id: generateId(),
        userId: member.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        read: false,
        createdAt: now,
      }))

    if (notifications.length > 0) {
      await notificationRepository.batchCreate(notifications)
    }
  }

   
  async notifyClassStudents(
    classId: string,
    data: Pick<Notification, "type" | "title"> & {
      content?: string
    },
    excludeUserId?: string
  ): Promise<void> {
    const members = await classMemberRepository.getByClass(classId)
    const now = new Date().toISOString()

    const notifications: Notification[] = members
      .filter((m) => m.role === "student" && m.userId !== excludeUserId)
      .map((member) => ({
        id: generateId(),
        userId: member.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        read: false,
        createdAt: now,
      }))

    if (notifications.length > 0) {
      await notificationRepository.batchCreate(notifications)
    }
  }
 
  async getNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    return notificationRepository.getByUser(userId, unreadOnly)
  }
 
  async getNotificationsPaginated(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<{ items: Notification[]; nextCursor: string | null }> {
    return notificationRepository.getByUserPaginated(userId, limit, cursor)
  }
 
  async markRead(id: string, userId: string): Promise<void> {
    const notification = await notificationRepository.getById(id)
    if (!notification) throw new Error("Notification not found")

    if (notification.userId !== userId) {
      throw new Error("Forbidden: You can only mark your own notifications as read")
    }

    await notificationRepository.markRead(id)
  }

   
  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId)
  }

  
  async getUnreadCount(userId: string): Promise<number> {
    return notificationRepository.getUnreadCount(userId)
  }

   
  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await notificationRepository.getById(id)
    if (!notification) throw new Error("Notification not found")

    if (notification.userId !== userId) {
      throw new Error("Forbidden: You can only delete your own notifications")
    }

    await notificationRepository.delete(id)
  }
}
