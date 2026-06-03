import { ResourceRepository } from "@/lib/repositories/resource-repository"
import { ResourceChapterRepository } from "@/lib/repositories/resource-chapter-repository"
import { ClassSettingsRepository } from "@/lib/repositories/class-settings-repository"
import { PermissionService } from "./permission-service"
import { DocumentIndexingService } from "./document-indexing-service"
import { generateId } from "@/lib/utils"
import type { ClassResource, ResourceChapter } from "@/lib/types/database"

const resourceRepository = new ResourceRepository()
const resourceChapterRepository = new ResourceChapterRepository()
const classSettingsRepository = new ClassSettingsRepository()
const permissionService = new PermissionService()
const documentIndexingService = new DocumentIndexingService()

export class ResourceService {
  /**
   * Upload a resource to the class media pool.
   * Checks class settings for student upload permissions.
   */

  async uploadResource(
    data: Pick<ClassResource, "classId" | "title" | "fileName" | "fileUrl" | "fileType" | "fileSize"> & {
      description?: string
      tags?: string[]
      linkedAssignmentId?: string
      chapterId?: string
    },
    userId: string
  ): Promise<ClassResource> {
    const member = await permissionService.requireMembership(data.classId, userId)

    // Check if students are allowed to upload
    if (member.role === "student") {
      const settings = await classSettingsRepository.getByClass(data.classId)
      if (settings && !settings.allowStudentUploads) {
        throw new Error("Student uploads are disabled for this class")
      }
    }

    await permissionService.requirePermission(data.classId, userId, "upload_files")

    const now = new Date().toISOString()

    const resource: ClassResource = {
      id: generateId(),
      classId: data.classId,
      uploadedBy: userId,
      title: data.title,
      description: data.description,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      fileSize: data.fileSize,
      tags: data.tags ?? [],
      linkedAssignmentId: data.linkedAssignmentId,
      chapterId: data.chapterId,
      aiIndexed: false,
      createdAt: now,
    }
    await resourceRepository.create(resource)

    return resource
  }

  /**
   * Update a resource's metadata.
   */
  async updateResource(
    resourceId: string,
    data: Partial<Pick<ClassResource, "title" | "description" | "tags" | "linkedAssignmentId">>,
    userId: string
  ): Promise<void> {
    const resource = await resourceRepository.getById(resourceId)
    if (!resource) throw new Error("Resource not found")

    // Only uploader or class managers can update
    if (resource.uploadedBy !== userId) {
      await permissionService.requirePermission(resource.classId, userId, "manage_class")
    }

    await resourceRepository.update(resourceId, data)
  }

  /**
   * Delete a resource.
   */
  async deleteResource(resourceId: string, userId: string): Promise<void> {
    const resource = await resourceRepository.getById(resourceId)
    if (!resource) throw new Error("Resource not found")

    // Only uploader or class managers can delete
    if (resource.uploadedBy !== userId) {
      await permissionService.requirePermission(resource.classId, userId, "manage_class")
    }

    await documentIndexingService.removeResourceIndex(resource.classId, resourceId)
    await resourceRepository.delete(resourceId)
  }

  /**
   * Get all resources for a class.
   */
  async getResourcesForClass(
    classId: string,
    userId: string
  ): Promise<ClassResource[]> {
    await permissionService.requireMembership(classId, userId)
    return resourceRepository.getByClass(classId)
  }

  /**
   * Get resources filtered by tags.
   */
  async getResourcesByTags(
    classId: string,
    tags: string[],
    userId: string
  ): Promise<ClassResource[]> {
    await permissionService.requireMembership(classId, userId)
    return resourceRepository.getByTags(classId, tags)
  }

  /**
   * Get resources linked to an assignment.
   */
  async getResourcesByAssignment(
    assignmentId: string,
    userId: string,
    classId: string
  ): Promise<ClassResource[]> {
    await permissionService.requireMembership(classId, userId)
    return resourceRepository.getByAssignment(assignmentId)
  }

  /**
   * Mark a resource as AI-indexed (after embedding pipeline processes it).
   */
  async markAsAIIndexed(resourceId: string): Promise<void> {
    await resourceRepository.markAsIndexed(resourceId)
  }

  /**
   * Get all AI-indexed resources for a class (for RAG context).
   */
  async getAIIndexedResources(classId: string): Promise<ClassResource[]> {
    return resourceRepository.getAIIndexed(classId)
  }

  /**
   * Get resources not yet indexed for AI.
   */
  async getUnindexedResources(classId: string): Promise<ClassResource[]> {
    return resourceRepository.getNotIndexed(classId)
  }

  /**
   * Link a resource to an assignment.
   */
  async linkToAssignment(
    resourceId: string,
    assignmentId: string,
    userId: string
  ): Promise<void> {
    const resource = await resourceRepository.getById(resourceId)
    if (!resource) throw new Error("Resource not found")

    await permissionService.requireRole(resource.classId, userId, "teacher")

    await resourceRepository.update(resourceId, {
      linkedAssignmentId: assignmentId,
    })
  }

  /**
   * Get a single resource.
   */
  async getResource(
    resourceId: string,
    userId: string
  ): Promise<ClassResource | null> {
    const resource = await resourceRepository.getById(resourceId)
    if (!resource) return null

    await permissionService.requireMembership(resource.classId, userId)
    return resource
  }

  // ─── Chapters ────────────────────────────────────────────────────────────────

  /** Get all chapters for a class, ordered by position. */
  async getChaptersForClass(classId: string, userId: string): Promise<ResourceChapter[]> {
    await permissionService.requireMembership(classId, userId)
    return resourceChapterRepository.getByClass(classId)
  }

  /** Create a new chapter. Only teachers/owners can manage chapters. */
  async createChapter(
    data: { classId: string; title: string; description?: string },
    userId: string
  ): Promise<ResourceChapter> {
    await permissionService.requirePermission(data.classId, userId, "manage_class")

    const existing = await resourceChapterRepository.getByClass(data.classId)
    const position = existing.length

    const now = new Date().toISOString()
    const chapter: ResourceChapter = {
      id: generateId(),
      classId: data.classId,
      title: data.title,
      description: data.description,
      position,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    }

    await resourceChapterRepository.create(chapter)
    return chapter
  }

  /** Update a chapter's title or description. */
  async updateChapter(
    chapterId: string,
    data: { title?: string; description?: string },
    userId: string
  ): Promise<void> {
    const chapter = await resourceChapterRepository.getById(chapterId)
    if (!chapter) throw new Error("Chapter not found")

    await permissionService.requirePermission(chapter.classId, userId, "manage_class")

    await resourceChapterRepository.update(chapterId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  /** Delete a chapter and move its resources to uncategorized. */
  async deleteChapter(chapterId: string, userId: string): Promise<void> {
    const chapter = await resourceChapterRepository.getById(chapterId)
    if (!chapter) throw new Error("Chapter not found")

    await permissionService.requirePermission(chapter.classId, userId, "manage_class")

    // Un-assign resources from this chapter
    const resources = await resourceRepository.getByChapter(chapterId)
    for (const r of resources) {
      await resourceRepository.update(r.id, { chapterId: undefined })
    }

    await resourceChapterRepository.delete(chapterId)
  }

  /** Move a resource into (or out of) a chapter. */
  async moveResourceToChapter(
    resourceId: string,
    chapterId: string | null,
    userId: string
  ): Promise<void> {
    const resource = await resourceRepository.getById(resourceId)
    if (!resource) throw new Error("Resource not found")

    await permissionService.requirePermission(resource.classId, userId, "manage_class")

    await resourceRepository.update(resourceId, {
      chapterId: chapterId ?? undefined,
    })
  }
}
