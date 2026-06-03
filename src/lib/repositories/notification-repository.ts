import { BaseRepository } from "./base-repository"
import type { Notification } from "@/lib/types/database"
import { db } from "@/lib/firebase/firebase-admin"

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super("notifications")
  }

  async getByUser(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    if (unreadOnly) {
      return this.queryManyMultiple(
        [
          { field: "userId", operator: "==", value: userId },
          { field: "read", operator: "==", value: false },
        ],
        "createdAt",
        "desc"
      )
    }
    return this.queryMany("userId", "==", userId, "createdAt", "desc")
  }

  async getByUserPaginated(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<{ items: Notification[]; nextCursor: string | null }> {
    return this.paginate(
      "userId",
      "==",
      userId,
      "createdAt",
      "desc",
      limit,
      cursor
    )
  }

  async markRead(id: string): Promise<void> {
    await this.update(id, { read: true })
  }

  async markAllRead(userId: string): Promise<void> {
    const unread = await this.queryManyMultiple([
      { field: "userId", operator: "==", value: userId },
      { field: "read", operator: "==", value: false },
    ])
    if (unread.length === 0) return
    const batch = db.batch()
    for (const notification of unread) {
      batch.update(this.collection.doc(notification.id), { read: true })
    }
    await batch.commit()
  }

  async getUnreadCount(userId: string): Promise<number> {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .where("read", "==", false)
      .count()
      .get()
    return snapshot.data().count
  }

  async deleteByUser(userId: string): Promise<void> {
    const notifications = await this.queryMany("userId", "==", userId)
    if (notifications.length > 0) {
      await this.batchDelete(notifications.map((n) => n.id))
    }
  }
}
