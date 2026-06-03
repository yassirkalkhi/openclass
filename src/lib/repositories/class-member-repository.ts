import { BaseRepository } from "./base-repository"
import type { ClassMember } from "@/lib/types/database"
import { normalizeClassRole } from "@/lib/permissions/normalize-roles"

export class ClassMemberRepository extends BaseRepository<ClassMember> {
  constructor() {
    super("classMembers")
  }

  async getByClassAndUser(
    classId: string,
    userId: string
  ): Promise<ClassMember | null> {
    const results = await this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "userId", operator: "==", value: userId },
    ])
    return results[0] ?? null
  }

  async getByClass(classId: string): Promise<ClassMember[]> {
    return this.queryMany("classId", "==", classId, "joinedAt", "asc")
  }

  async getByUser(userId: string): Promise<ClassMember[]> {
    return this.queryMany("userId", "==", userId, "joinedAt", "desc")
  }

  async getByClassAndRole(
    classId: string,
    role: ClassMember["role"]
  ): Promise<ClassMember[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "role", operator: "==", value: role },
    ])
  }

  async deleteByClassAndUser(classId: string, userId: string): Promise<void> {
    const member = await this.getByClassAndUser(classId, userId)
    if (member) {
      await this.delete(member.id)
    }
  }

  async countByClass(classId: string): Promise<number> {
    const snapshot = await this.collection
      .where("classId", "==", classId)
      .count()
      .get()
    return snapshot.data().count
  }

  async isTeacher(classId: string, userId: string): Promise<boolean> {
    const member = await this.getByClassAndUser(classId, userId)
    return normalizeClassRole(member?.role) === "teacher"
  }
}
