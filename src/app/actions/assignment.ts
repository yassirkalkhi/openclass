"use server"

import { AssignmentService } from "@/lib/services/assignment-service"
import { actionError, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Assignment, AssignmentSubmission } from "@/lib/types/database"

const assignmentService = new AssignmentService()

export async function getClassAssignmentsAction(
  classId: string
): Promise<ActionResult<Assignment[]>> {
  try {
    const userId = await getActionUserId()
    const assignments = await assignmentService.getAssignmentsForClass(classId, userId)
    return { success: true, data: assignments }
  } catch (e) {
    return actionError(e)
  }
}

export async function createAssignmentAction(
  data: Pick<Assignment, "classId" | "title"> & {
    description?: string
    attachments?: string[]
    attachmentNames?: string[]
    dueDate?: string
    maxScore?: number
    allowLateSubmission?: boolean
  }
): Promise<ActionResult<Assignment>> {
  try {
    const userId = await getActionUserId()
    const assignment = await assignmentService.createAssignment(data, userId)
    return { success: true, data: assignment }
  } catch (e) {
    return actionError(e)
  }
}

export async function updateAssignmentAction(
  assignmentId: string,
  data: Partial<
    Pick<Assignment, "title" | "description" | "attachments" | "attachmentNames" | "dueDate" | "maxScore" | "allowLateSubmission">
  >
): Promise<ActionResult<void>> {
  try {
    const userId = await getActionUserId()
    await assignmentService.updateAssignment(assignmentId, data, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function deleteAssignmentAction(
  assignmentId: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getActionUserId()
    await assignmentService.deleteAssignment(assignmentId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function submitAssignmentAction(
  assignmentId: string,
  data: { content?: string; attachments?: AssignmentSubmission["attachments"] }
): Promise<ActionResult<AssignmentSubmission>> {
  try {
    const userId = await getActionUserId()
    const submission = await assignmentService.submitAssignment(assignmentId, userId, data)
    return { success: true, data: submission }
  } catch (e) {
    return actionError(e)
  }
}

export async function getAssignmentSubmissionsAction(
  assignmentId: string
): Promise<ActionResult<AssignmentSubmission[]>> {
  try {
    const userId = await getActionUserId()
    const submissions = await assignmentService.getSubmissions(assignmentId, userId)
    return { success: true, data: submissions }
  } catch (e) {
    return actionError(e)
  }
}

export async function getAssignmentAction(
  assignmentId: string
): Promise<ActionResult<Assignment>> {
  try {
    const userId = await getActionUserId()
    const assignment = await assignmentService.getAssignment(assignmentId, userId)
    if (!assignment) return { success: false, error: "Assignment not found" }
    return { success: true, data: assignment }
  } catch (e) {
    return actionError(e)
  }
}

export async function gradeSubmissionAction(
  submissionId: string,
  score: number,
  feedback?: string
): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await assignmentService.gradeSubmission(submissionId, score, feedback, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}

export async function saveDraftAction(
  assignmentId: string,
  data: { content?: string; attachments?: AssignmentSubmission["attachments"] }
): Promise<ActionResult<AssignmentSubmission>> {
  try {
    const userId = await getActionUserId()
    const submission = await assignmentService.saveDraft(assignmentId, userId, data)
    return { success: true, data: submission }
  } catch (e) {
    return actionError(e)
  }
}

export async function getMySubmissionsForClassAction(
  classId: string
): Promise<ActionResult<Pick<AssignmentSubmission, "assignmentId" | "status">[]>> {
  try {
    const userId = await getActionUserId()
    const submissions = await assignmentService.getStudentSubmissionsForClass(classId, userId)
    return {
      success: true,
      data: submissions.map((s) => ({ assignmentId: s.assignmentId, status: s.status })),
    }
  } catch (e) {
    return actionError(e)
  }
}
