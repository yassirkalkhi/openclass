import { BaseRepository } from "./base-repository"
import type { Channel } from "@/lib/types/database"
import { db } from "@/lib/firebase/firebase-admin"

export class ChannelRepository extends BaseRepository<Channel> {
  constructor() {
    super("channels")
  }

  async getByClass(classId: string): Promise<Channel[]> {
    return this.queryMany("classId", "==", classId, "position", "asc")
  }

  async getByClassAndType(
    classId: string,
    type: Channel["type"]
  ): Promise<Channel[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "type", operator: "==", value: type },
      ],
      "position",
      "asc"
    )
  }

  async getByCategory(categoryId: string): Promise<Channel[]> {
    return this.queryMany("categoryId", "==", categoryId, "position", "asc")
  }

  async getUncategorized(classId: string): Promise<Channel[]> {
    // Channels with no categoryId
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "categoryId", operator: "==", value: null },
      ],
      "position",
      "asc"
    )
  }

  async reorder(channelIds: string[]): Promise<void> {
    const batch = db.batch()
    channelIds.forEach((id, index) => {
      batch.update(this.collection.doc(id), { position: index })
    })
    await batch.commit()
  }

  async getMaxPosition(classId: string): Promise<number> {
    const snapshot = await this.collection
      .where("classId", "==", classId)
      .get()
    if (snapshot.empty) return -1
    const positions = snapshot.docs.map((doc) => (doc.data() as Channel).position)
    return Math.max(...positions)
  }

  async deleteByClass(classId: string): Promise<void> {
    const channels = await this.getByClass(classId)
    if (channels.length > 0) {
      await this.batchDelete(channels.map((c) => c.id))
    }
  }
}
