import { BaseRepository } from "./base-repository"
import type { AssignmentSubmission } from "@/lib/types/database"

export class SubmissionRepository extends BaseRepository<AssignmentSubmission> {
  constructor() {
    super("assignmentSubmissions")
  }

  async getByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.queryMany("assignmentId", "==", assignmentId, "createdAt", "desc")
  }

  async getByStudent(
    assignmentId: string,
    studentId: string
  ): Promise<AssignmentSubmission | null> {
    const results = await this.queryManyMultiple([
      { field: "assignmentId", operator: "==", value: assignmentId },
      { field: "studentId", operator: "==", value: studentId },
    ])
    return results[0] ?? null
  }

  async getByStudentAcrossClass(
    classId: string,
    studentId: string
  ): Promise<AssignmentSubmission[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "studentId", operator: "==", value: studentId },
      ],
      "createdAt",
      "desc"
    )
  }

  async getByStatus(
    assignmentId: string,
    status: AssignmentSubmission["status"]
  ): Promise<AssignmentSubmission[]> {
    return this.queryManyMultiple([
      { field: "assignmentId", operator: "==", value: assignmentId },
      { field: "status", operator: "==", value: status },
    ])
  }

  async getGradedByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    return this.getByStatus(assignmentId, "graded")
  }

  async countByAssignment(assignmentId: string): Promise<number> {
    const snapshot = await this.collection
      .where("assignmentId", "==", assignmentId)
      .count()
      .get()
    return snapshot.data().count
  }

  async countByStatus(
    assignmentId: string,
    status: AssignmentSubmission["status"]
  ): Promise<number> {
    const snapshot = await this.collection
      .where("assignmentId", "==", assignmentId)
      .where("status", "==", status)
      .count()
      .get()
    return snapshot.data().count
  }
}
