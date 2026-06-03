import { AssignmentRepository } from "@/lib/repositories/assignment-repository"
import { SubmissionRepository } from "@/lib/repositories/submission-repository"
import { ClassMemberRepository } from "@/lib/repositories/class-member-repository"
import { PermissionService } from "./permission-service"
import { generateId } from "@/lib/utils"
import type { Assignment, AssignmentSubmission, MessageAttachment } from "@/lib/types/database"

const assignmentRepository = new AssignmentRepository()
const submissionRepository = new SubmissionRepository()
const classMemberRepository = new ClassMemberRepository()
const permissionService = new PermissionService()

export class AssignmentService {
  /**
   * Create a new assignment. Only teachers and owners can create assignments.
   */
  async createAssignment(
    data: Pick<Assignment, "classId" | "title"> & {
      channelId?: string
      description?: string
      attachments?: string[]
      dueDate?: string
      maxScore?: number
      allowLateSubmission?: boolean
    },
    userId: string
  ): Promise<Assignment> {
    await permissionService.requireRole(data.classId, userId, "teacher")

    const now = new Date().toISOString()

    const assignment: Assignment = {
      id: generateId(),
      classId: data.classId,
      channelId: data.channelId,
      createdBy: userId,
      title: data.title,
      description: data.description,
      attachments: data.attachments,
      dueDate: data.dueDate,
      maxScore: data.maxScore,
      allowLateSubmission: data.allowLateSubmission ?? false,
      createdAt: now,
      updatedAt: now,
    }
    await assignmentRepository.create(assignment)

    return assignment
  }

  /**
   * Update an assignment. Only the creator or class managers can update.
   */
  async updateAssignment(
    assignmentId: string,
    data: Partial<
      Pick<
        Assignment,
        "title" | "description" | "attachments" | "dueDate" | "maxScore" | "allowLateSubmission"
      >
    >,
    userId: string
  ): Promise<void> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    await permissionService.requireRole(assignment.classId, userId, "teacher")

    await assignmentRepository.update(assignmentId, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Delete an assignment and all its submissions.
   */
  async deleteAssignment(assignmentId: string, userId: string): Promise<void> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    await permissionService.requireRole(assignment.classId, userId, "teacher")

    // Delete all submissions for this assignment
    const submissions = await submissionRepository.getByAssignment(assignmentId)
    if (submissions.length > 0) {
      await submissionRepository.batchDelete(submissions.map((s) => s.id))
    }

    await assignmentRepository.delete(assignmentId)
  }

  /**
   * Submit an assignment.
   */
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    data: {
      content?: string
      attachments?: MessageAttachment[]
    }
  ): Promise<AssignmentSubmission> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    // Verify the student is a member of the class
    await permissionService.requireMembership(assignment.classId, studentId)

    // Check if already submitted
    const existing = await submissionRepository.getByStudent(assignmentId, studentId)
    if (existing && existing.status !== "draft") {
      throw new Error("You have already submitted this assignment")
    }

    // Check if past due date
    const now = new Date()
    const isLate = assignment.dueDate && new Date(assignment.dueDate) < now

    if (isLate && !assignment.allowLateSubmission) {
      throw new Error("This assignment is past due and does not allow late submissions")
    }

    const nowIso = now.toISOString()

    if (existing) {
      // Update existing draft
      await submissionRepository.update(existing.id, {
        content: data.content,
        attachments: data.attachments,
        status: isLate ? "late" : "submitted",
        submittedAt: nowIso,
      })
      return { ...existing, ...data, status: isLate ? "late" : "submitted", submittedAt: nowIso }
    }

    const submission: AssignmentSubmission = {
      id: generateId(),
      assignmentId,
      classId: assignment.classId,
      studentId,
      content: data.content,
      attachments: data.attachments,
      status: isLate ? "late" : "submitted",
      submittedAt: nowIso,
      createdAt: nowIso,
    }
    await submissionRepository.create(submission)

    return submission
  }

  /**
   * Save a draft submission (before formally submitting).
   */
  async saveDraft(
    assignmentId: string,
    studentId: string,
    data: {
      content?: string
      attachments?: MessageAttachment[]
    }
  ): Promise<AssignmentSubmission> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    await permissionService.requireMembership(assignment.classId, studentId)

    const existing = await submissionRepository.getByStudent(assignmentId, studentId)
    const now = new Date().toISOString()

    if (existing) {
      await submissionRepository.update(existing.id, {
        content: data.content,
        attachments: data.attachments,
        status: "draft",
      })
      return { ...existing, ...data, status: "draft" as const }
    }

    const submission: AssignmentSubmission = {
      id: generateId(),
      assignmentId,
      classId: assignment.classId,
      studentId,
      content: data.content,
      attachments: data.attachments,
      status: "draft",
      createdAt: now,
    }
    await submissionRepository.create(submission)

    return submission
  }

  /**
   * Grade a submission. Only teachers/owners can grade.
   */
  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string | undefined,
    userId: string
  ): Promise<void> {
    const submission = await submissionRepository.getById(submissionId)
    if (!submission) throw new Error("Submission not found")

    await permissionService.requireRole(submission.classId, userId, "teacher")

    const assignment = await assignmentRepository.getById(submission.assignmentId)
    if (assignment?.maxScore !== undefined && score > assignment.maxScore) {
      throw new Error(`Score cannot exceed the maximum of ${assignment.maxScore}`)
    }

    await submissionRepository.update(submissionId, {
      score,
      feedback,
      status: "graded",
      gradedAt: new Date().toISOString(),
    })
  }

  /**
   * Get assignments for a class.
   */
  async getAssignmentsForClass(
    classId: string,
    userId: string
  ): Promise<Assignment[]> {
    await permissionService.requireMembership(classId, userId)
    return assignmentRepository.getByClass(classId)
  }

  /**
   * Get a single assignment.
   */
  async getAssignment(
    assignmentId: string,
    userId: string
  ): Promise<Assignment | null> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) return null

    await permissionService.requireMembership(assignment.classId, userId)
    return assignment
  }

  /**
   * Get submissions for an assignment.
   * Teachers see all, students see only their own.
   */
  async getSubmissions(
    assignmentId: string,
    userId: string
  ): Promise<AssignmentSubmission[]> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    const member = await permissionService.requireMembership(
      assignment.classId,
      userId
    )

    if (member.role === "student") {
      // Students can only see their own submission
      const submission = await submissionRepository.getByStudent(assignmentId, userId)
      return submission ? [submission] : []
    }

    // Teachers and owners see all submissions
    return submissionRepository.getByAssignment(assignmentId)
  }

  /**
   * Get a student's submission for an assignment.
   */
  async getStudentSubmission(
    assignmentId: string,
    studentId: string,
    requesterId: string
  ): Promise<AssignmentSubmission | null> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    const member = await permissionService.requireMembership(
      assignment.classId,
      requesterId
    )

    // Students can only view their own
    if (member.role === "student" && studentId !== requesterId) {
      throw new Error("Forbidden: You can only view your own submission")
    }

    return submissionRepository.getByStudent(assignmentId, studentId)
  }

  /**
   * Get upcoming assignments for a class.
   */
  async getUpcomingAssignments(
    classId: string,
    userId: string
  ): Promise<Assignment[]> {
    await permissionService.requireMembership(classId, userId)
    return assignmentRepository.getUpcoming(classId)
  }

  /**
   * Get all of a student's own submissions across a class (lightweight, for list views).
   */
  async getStudentSubmissionsForClass(
    classId: string,
    studentId: string
  ): Promise<AssignmentSubmission[]> {
    await permissionService.requireMembership(classId, studentId)
    return submissionRepository.getByStudentAcrossClass(classId, studentId)
  }
}
