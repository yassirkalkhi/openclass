import { BaseRepository } from "./base-repository"
import type { VideoRoom } from "@/lib/types/database"

export class VideoRoomRepository extends BaseRepository<VideoRoom> {
  constructor() {
    super("videoRooms")
  }

  async getByChannel(channelId: string): Promise<VideoRoom | null> {
    return this.queryOne("channelId", "==", channelId)
  }

  async getActiveByChannel(channelId: string): Promise<VideoRoom | null> {
    const results = await this.queryManyMultiple([
      { field: "channelId", operator: "==", value: channelId },
      { field: "active", operator: "==", value: true },
    ])
    return results[0] ?? null
  }

  async getActiveByClass(classId: string): Promise<VideoRoom[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "active", operator: "==", value: true },
    ])
  }

  async getByClass(classId: string): Promise<VideoRoom[]> {
    return this.queryMany("classId", "==", classId, "createdAt", "desc")
  }

  async deactivate(id: string): Promise<void> {
    await this.update(id, { active: false })
  }

  async deleteByClass(classId: string): Promise<void> {
    const rooms = await this.getByClass(classId)
    if (rooms.length > 0) {
      await this.batchDelete(rooms.map((r) => r.id))
    }
  }
}
