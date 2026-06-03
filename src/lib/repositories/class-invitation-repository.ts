import { BaseRepository } from "./base-repository"
import type { ClassInvitation } from "@/lib/types/database"

export class ClassInvitationRepository extends BaseRepository<ClassInvitation> {
  constructor() {
    super("classInvitations")
  }

  async getPendingByInvitee(userId: string): Promise<ClassInvitation[]> {
    return this.queryManyMultiple(
      [
        { field: "inviteeUserId", operator: "==", value: userId },
        { field: "status", operator: "==", value: "pending" },
      ],
      "createdAt",
      "desc"
    )
  }

  async getPendingByClass(classId: string): Promise<ClassInvitation[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "status", operator: "==", value: "pending" },
      ],
      "createdAt",
      "desc"
    )
  }

  async getPendingForClassAndInvitee(
    classId: string,
    inviteeUserId: string
  ): Promise<ClassInvitation | null> {
    const results = await this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "inviteeUserId", operator: "==", value: inviteeUserId },
      { field: "status", operator: "==", value: "pending" },
    ])
    return results[0] ?? null
  }
}
