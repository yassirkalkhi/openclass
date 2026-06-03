import { BaseRepository } from "./base-repository"
import type { ChannelCategory } from "@/lib/types/database"
import { db } from "@/lib/firebase/firebase-admin"

export class ChannelCategoryRepository extends BaseRepository<ChannelCategory> {
  constructor() {
    super("channelCategories")
  }

  async getByClass(classId: string): Promise<ChannelCategory[]> {
    return this.queryMany("classId", "==", classId, "position", "asc")
  }

  async reorder(categoryIds: string[]): Promise<void> {
    const batch = db.batch()
    categoryIds.forEach((id, index) => {
      batch.update(this.collection.doc(id), { position: index })
    })
    await batch.commit()
  }

  async getMaxPosition(classId: string): Promise<number> {
    const snapshot = await this.collection
      .where("classId", "==", classId)
      .get()
    if (snapshot.empty) return -1
    const positions = snapshot.docs.map((doc) => (doc.data() as ChannelCategory).position)
    return Math.max(...positions)
  }

  async deleteByClass(classId: string): Promise<void> {
    const categories = await this.getByClass(classId)
    if (categories.length > 0) {
      await this.batchDelete(categories.map((c) => c.id))
    }
  }
}
