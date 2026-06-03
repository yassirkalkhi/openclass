import { BaseRepository } from "./base-repository"
import type { ClassSettings } from "@/lib/types/database"

export class ClassSettingsRepository extends BaseRepository<ClassSettings> {
  constructor() {
    super("classSettings")
  }

  async getByClass(classId: string): Promise<ClassSettings | null> {
    return this.queryOne("classId", "==", classId)
  }

  async upsert(data: ClassSettings): Promise<ClassSettings> {
    const existing = await this.getByClass(data.classId)
    if (existing) {
      await this.update(existing.id, data)
      return { ...existing, ...data }
    }
    return this.create(data)
  }

  async deleteByClass(classId: string): Promise<void> {
    const settings = await this.getByClass(classId)
    if (settings) {
      await this.delete(settings.id)
    }
  }
}
