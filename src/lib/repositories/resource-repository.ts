import { BaseRepository } from "./base-repository"
import type { ClassResource } from "@/lib/types/database"

export class ResourceRepository extends BaseRepository<ClassResource> {
  constructor() {
    super("classResources")
  }

  async getByClass(classId: string): Promise<ClassResource[]> {
    return this.queryMany("classId", "==", classId, "createdAt", "desc")
  }

  async getByTags(classId: string, tags: string[]): Promise<ClassResource[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "tags", operator: "array-contains-any", value: tags },
    ])
  }

  async getAIIndexed(classId: string): Promise<ClassResource[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "aiIndexed", operator: "==", value: true },
    ])
  }

  async getNotIndexed(classId: string): Promise<ClassResource[]> {
    return this.queryManyMultiple([
      { field: "classId", operator: "==", value: classId },
      { field: "aiIndexed", operator: "==", value: false },
    ])
  }

  async getByAssignment(assignmentId: string): Promise<ClassResource[]> {
    return this.queryMany("linkedAssignmentId", "==", assignmentId, "createdAt", "desc")
  }

  async getByUploader(classId: string, uploadedBy: string): Promise<ClassResource[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "uploadedBy", operator: "==", value: uploadedBy },
      ],
      "createdAt",
      "desc"
    )
  }

  async getByFileType(classId: string, fileType: string): Promise<ClassResource[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "fileType", operator: "==", value: fileType },
      ],
      "createdAt",
      "desc"
    )
  }

  async markAsIndexed(id: string): Promise<void> {
    await this.update(id, { aiIndexed: true })
  }

  async deleteByClass(classId: string): Promise<void> {
    const resources = await this.getByClass(classId)
    if (resources.length > 0) {
      await this.batchDelete(resources.map((r) => r.id))
    }
  }

  async getByChapter(chapterId: string): Promise<ClassResource[]> {
    return this.queryMany("chapterId", "==", chapterId, "createdAt", "desc")
  }
}
