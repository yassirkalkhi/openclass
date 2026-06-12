import { AssignmentRepository } from "@/lib/repositories/assignment-repository"
import { SubmissionRepository } from "@/lib/repositories/submission-repository"
import { PermissionService } from "./permission-service"
import { NotificationService } from "./notification-service"
import { generateId } from "@/lib/utils"
import type { Assignment, AssignmentSubmission, MessageAttachment } from "@/lib/types/database"

const assignmentRepository = new AssignmentRepository()
const submissionRepository = new SubmissionRepository()
const permissionService = new PermissionService()
const notificationService = new NotificationService()

export class AssignmentService {
 
  async createAssignment(
    data: Pick<Assignment, "classId" | "title"> & {
      channelId?: string
      description?: string
      attachments?: string[]
      attachmentNames?: string[]
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
      attachmentNames: data.attachmentNames,
      dueDate: data.dueDate,
      maxScore: data.maxScore,
      allowLateSubmission: data.allowLateSubmission ?? false,
      createdAt: now,
      updatedAt: now,
    }
    await assignmentRepository.create(assignment)

    // Notify all students in the class about the new assignment
    const dueDateNote = data.dueDate
      ? ` Due: ${new Date(data.dueDate).toLocaleDateString()}.`
      : ""
    await notificationService.notifyClassStudents(
      data.classId,
      {
        type: "announcement",
        title: `New assignment: ${data.title}`,
        content: `A new assignment has been posted.${dueDateNote}`,
      },
      userId
    )

    return assignment
  }
 
  async updateAssignment(
    assignmentId: string,
    data: Partial<
      Pick<
        Assignment,
        "title" | "description" | "attachments" | "attachmentNames" | "dueDate" | "maxScore" | "allowLateSubmission"
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

   
  async deleteAssignment(assignmentId: string, userId: string): Promise<void> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) throw new Error("Assignment not found")

    await permissionService.requireRole(assignment.classId, userId, "teacher")

     
    const submissions = await submissionRepository.getByAssignment(assignmentId)
    if (submissions.length > 0) {
      await submissionRepository.batchDelete(submissions.map((s) => s.id))
    }

    await assignmentRepository.delete(assignmentId)
  }

   
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

    
    await permissionService.requireMembership(assignment.classId, studentId)

 
    const existing = await submissionRepository.getByStudent(assignmentId, studentId)
    if (existing && existing.status !== "draft") {
      throw new Error("You have already submitted this assignment")
    }

    
    const now = new Date()
    const isLate = assignment.dueDate && new Date(assignment.dueDate) < now

    if (isLate && !assignment.allowLateSubmission) {
      throw new Error("This assignment is past due and does not allow late submissions")
    }

    const nowIso = now.toISOString()

    if (existing) {
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

 
  async getAssignmentsForClass(
    classId: string,
    userId: string
  ): Promise<Assignment[]> {
    await permissionService.requireMembership(classId, userId)
    return assignmentRepository.getByClass(classId)
  }

 
  async getAssignment(
    assignmentId: string,
    userId: string
  ): Promise<Assignment | null> {
    const assignment = await assignmentRepository.getById(assignmentId)
    if (!assignment) return null

    await permissionService.requireMembership(assignment.classId, userId)
    return assignment
  }

 
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
      
      const submission = await submissionRepository.getByStudent(assignmentId, userId)
      return submission ? [submission] : []
    }

 
    return submissionRepository.getByAssignment(assignmentId)
  }

 
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
     if (member.role === "student" && studentId !== requesterId) {
      throw new Error("Forbidden: You can only view your own submission")
    }

    return submissionRepository.getByStudent(assignmentId, studentId)
  }

 
  async getUpcomingAssignments(
    classId: string,
    userId: string
  ): Promise<Assignment[]> {
    await permissionService.requireMembership(classId, userId)
    return assignmentRepository.getUpcoming(classId)
  }
 
  async getStudentSubmissionsForClass(
    classId: string,
    studentId: string
  ): Promise<AssignmentSubmission[]> {
    await permissionService.requireMembership(classId, studentId)
    return submissionRepository.getByStudentAcrossClass(classId, studentId)
  }
}
