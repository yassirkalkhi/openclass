import { BaseRepository } from "./base-repository"
import type { Assignment } from "@/lib/types/database"

export class AssignmentRepository extends BaseRepository<Assignment> {
  constructor() {
    super("assignments")
  }

  async getByClass(classId: string): Promise<Assignment[]> {
    return this.queryMany("classId", "==", classId, "createdAt", "desc")
  }

  async getByChannel(channelId: string): Promise<Assignment[]> {
    return this.queryMany("channelId", "==", channelId, "createdAt", "desc")
  }

  async getByCreator(createdBy: string): Promise<Assignment[]> {
    return this.queryMany("createdBy", "==", createdBy, "createdAt", "desc")
  }

  async getUpcoming(classId: string): Promise<Assignment[]> {
    const now = new Date().toISOString()
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "dueDate", operator: ">=", value: now },
      ],
      "dueDate",
      "asc"
    )
  }

  async getOverdue(classId: string): Promise<Assignment[]> {
    const now = new Date().toISOString()
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "dueDate", operator: "<", value: now },
      ],
      "dueDate",
      "desc"
    )
  }

  async deleteByClass(classId: string): Promise<void> {
    const assignments = await this.getByClass(classId)
    if (assignments.length > 0) {
      await this.batchDelete(assignments.map((a) => a.id))
    }
  }
}
