import { BaseRepository } from "./base-repository"
import type { ResourceChapter } from "@/lib/types/database"

export class ResourceChapterRepository extends BaseRepository<ResourceChapter> {
  constructor() {
    super("resourceChapters")
  }

  async getByClass(classId: string): Promise<ResourceChapter[]> {
    return this.queryMany("classId", "==", classId, "position", "asc")
  }

  async deleteByClass(classId: string): Promise<void> {
    const chapters = await this.getByClass(classId)
    if (chapters.length > 0) {
      await this.batchDelete(chapters.map((c) => c.id))
    }
  }
}
