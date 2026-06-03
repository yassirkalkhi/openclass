"use server"

import { ResourceService } from "@/lib/services/resource-service"
import { DocumentIndexingService } from "@/lib/services/document-indexing-service"
import { actionError, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { ClassResource, ResourceChapter } from "@/lib/types/database"

const resourceService = new ResourceService()
const documentIndexingService = new DocumentIndexingService()

function isIndexableFile(fileType: string, title: string): boolean {
  const t = fileType.toLowerCase()
  const name = title.toLowerCase()
  return (
    t.includes("pdf") ||
    name.endsWith(".pdf") ||
    t.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  )
}

// ─── Resources ───────────────────────────────────────────────────────────────

export async function getClassResourcesAction(
  classId: string
): Promise<ActionResult<ClassResource[]>> {
  try {
    const userId = await getActionUserId()
    const resources = await resourceService.getResourcesForClass(classId, userId)
    return { success: true, data: resources }
  } catch (e) {
    return actionError(e)
  }
}

export async function uploadResourceAction(data: {
  classId: string
  title: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  description?: string
  chapterId?: string
}): Promise<ActionResult<ClassResource>> {
  try {
    const userId = await getActionUserId()
    const resource = await resourceService.uploadResource(data, userId)

    if (isIndexableFile(resource.fileType, resource.title)) {
      try {
        await documentIndexingService.indexResource(
          resource.classId,
          resource.id,
          resource.fileUrl,
          resource.fileType,
          resource.title
        )
        return { success: true, data: { ...resource, aiIndexed: true } }
      } catch {
        // Resource remains uploaded; indexing can be retried manually
      }
    }

    return { success: true, data: resource }
  } catch (e) {
    return actionError(e)
  }
}

export async function deleteResourceAction(resourceId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await resourceService.deleteResource(resourceId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function indexResourceAction(
  resourceId: string
): Promise<ActionResult<{ chunkCount: number }>> {
  try {
    const userId = await getActionUserId()
    const resource = await resourceService.getResource(resourceId, userId)
    if (!resource) return { success: false, error: "Resource not found" }

    const result = await documentIndexingService.indexResource(
      resource.classId,
      resource.id,
      resource.fileUrl,
      resource.fileType,
      resource.title
    )
    return { success: true, data: result }
  } catch (e) {
    return actionError(e)
  }
}

export async function moveResourceToChapterAction(
  resourceId: string,
  chapterId: string | null
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await resourceService.moveResourceToChapter(resourceId, chapterId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

// ─── Chapters ────────────────────────────────────────────────────────────────

export async function getClassChaptersAction(
  classId: string
): Promise<ActionResult<ResourceChapter[]>> {
  try {
    const userId = await getActionUserId()
    const chapters = await resourceService.getChaptersForClass(classId, userId)
    return { success: true, data: chapters }
  } catch (e) {
    return actionError(e)
  }
}

export async function createChapterAction(data: {
  classId: string
  title: string
  description?: string
}): Promise<ActionResult<ResourceChapter>> {
  try {
    const userId = await getActionUserId()
    const chapter = await resourceService.createChapter(data, userId)
    return { success: true, data: chapter }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateChapterAction(
  chapterId: string,
  data: { title?: string; description?: string }
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await resourceService.updateChapter(chapterId, data, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function deleteChapterAction(chapterId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await resourceService.deleteChapter(chapterId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
