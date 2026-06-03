"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  getAssignmentAction,
  getAssignmentSubmissionsAction,
  submitAssignmentAction,
  saveDraftAction,
  gradeSubmissionAction,
} from "@/app/actions/assignment"
import { useClass } from "@/context/class-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { Assignment, AssignmentSubmission, MessageAttachment } from "@/lib/types/database"
import { Calendar, Clock, FileText, Send, Save, CheckCircle2, AlertCircle, User, Award, ArrowLeft, Paperclip, X, FileIcon, Loader2 } from "lucide-react"
import { format, isPast } from "date-fns"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { useUploadThing } from "@/lib/uploadthing"
import { generateId } from "@/lib/utils"

function getStatusInfo(status: AssignmentSubmission["status"], t: any) {
  return {
    draft: { variant: "outline" as const, icon: FileText, label: t.assignments.draft },
    submitted: { variant: "default" as const, icon: CheckCircle2, label: t.assignments.submitted },
    late: { variant: "destructive" as const, icon: AlertCircle, label: t.assignments.late },
    graded: { variant: "secondary" as const, icon: Award, label: t.assignments.graded },
  }[status] ?? { variant: "outline" as const, icon: FileText, label: t.assignments.draft }
}

function AttachmentList({
  attachments,
  onRemove,
}: {
  attachments: MessageAttachment[]
  onRemove?: (id: string) => void
}) {
  if (attachments.length === 0) return null
  return (
    <ul className="space-y-1.5 mt-2">
      {attachments.map((att) => (
        <li
          key={att.id}
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
        >
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
          <a
            href={att.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {att.fileName}
          </a>
          <span className="text-xs text-muted-foreground shrink-0">
            {(att.fileSize / 1024 / 1024).toFixed(1)} MB
          </span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Remove attachment"
            >
              <X className="size-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function AssignmentDetailPage() {
  const { assignmentId, classSlug } = useParams<{ assignmentId: string; classSlug: string }>()
  const { membership, classData } = useClass()
  const { t } = useI18n()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [gradeDialog, setGradeDialog] = useState<{ open: boolean; submission: AssignmentSubmission | null }>({ open: false, submission: null })
  const [gradeForm, setGradeForm] = useState({ score: "", feedback: "" })

  const isStudent = membership.role === "student"
  const isTeacher = membership.role === "teacher"

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("classFile", {
    onClientUploadComplete: (res: Array<{ serverData: unknown; url: string; name: string; type: string; size: number }>) => {
      const newAttachments: MessageAttachment[] = res.map((file) => {
        const data = file.serverData as { fileUrl?: string; fileName?: string; fileType?: string; fileSize?: number } | undefined
        return {
          id: generateId(),
          messageId: assignmentId,
          fileName: data?.fileName ?? file.name,
          fileUrl: data?.fileUrl ?? file.url,
          fileType: data?.fileType ?? file.type ?? "application/pdf",
          fileSize: data?.fileSize ?? file.size,
          createdAt: new Date().toISOString(),
        }
      })
      setAttachments((prev) => [...prev, ...newAttachments])
    },
    onUploadError: (err: Error) => {
      console.error("Upload error:", err.message)
    },
  })

  useEffect(() => { loadData() }, [assignmentId])

  async function loadData() {
    const [assignmentRes, submissionsRes] = await Promise.all([
      getAssignmentAction(assignmentId),
      getAssignmentSubmissionsAction(assignmentId),
    ])
    if (assignmentRes.success && assignmentRes.data) setAssignment(assignmentRes.data)
    if (submissionsRes.success && submissionsRes.data) {
      setSubmissions(submissionsRes.data)
      if (isStudent && submissionsRes.data[0]) {
        setContent(submissionsRes.data[0].content || "")
        setAttachments(submissionsRes.data[0].attachments || [])
      }
    }
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    const pdfFiles = Array.from(files).filter((f) => f.type === "application/pdf")
    if (pdfFiles.length === 0) return
    await startUpload(pdfFiles, { classId: classData.id })
    e.target.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await submitAssignmentAction(assignmentId, {
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
    setLoading(false)
    if (result.success) loadData()
  }

  async function handleSaveDraft() {
    setLoading(true)
    const result = await saveDraftAction(assignmentId, {
      content,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
    setLoading(false)
    if (result.success) loadData()
  }

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    if (!gradeDialog.submission) return
    setLoading(true)
    const result = await gradeSubmissionAction(gradeDialog.submission.id, Number(gradeForm.score), gradeForm.feedback || undefined)
    setLoading(false)
    if (result.success) {
      setGradeDialog({ open: false, submission: null })
      setGradeForm({ score: "", feedback: "" })
      loadData()
    }
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="size-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.assignments.loadingAssignment}</p>
        </div>
      </div>
    )
  }

  const mySubmission = isStudent ? submissions[0] : null
  const isPastDue = assignment.dueDate && isPast(new Date(assignment.dueDate))
  const canSubmit = isStudent && (!isPastDue || assignment.allowLateSubmission)
  const isSubmitted = mySubmission?.status === "submitted" || mySubmission?.status === "late" || mySubmission?.status === "graded"

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Back + Header */}
          <div>
            <Link href={`/app/${classSlug}/assignments`}>
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="size-4 mr-2" />
                {t.assignments.backToAssignments}
              </Button>
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
                {assignment.description && (
                  <p className="text-muted-foreground">{assignment.description}</p>
                )}
              </div>
              {mySubmission && (
                <Badge variant={getStatusInfo(mySubmission.status, t).variant} className="shrink-0">
                  {React.createElement(getStatusInfo(mySubmission.status, t).icon, { className: "size-3 mr-1" })}
                  {getStatusInfo(mySubmission.status, t).label}
                </Badge>
              )}
            </div>
          </div>

          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.assignments.details}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignment.dueDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">{t.assignments.due}</span>
                  <span>{format(new Date(assignment.dueDate), "MMMM d, yyyy 'at' h:mm a")}</span>
                  {isPastDue && <Badge variant="destructive" className="ml-2">{t.assignments.pastDue}</Badge>}
                </div>
              )}
              {assignment.maxScore !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="size-4 text-muted-foreground" />
                  <span className="font-medium">{t.assignments.maxPoints}:</span>
                  <span>{assignment.maxScore}</span>
                </div>
              )}
              {assignment.allowLateSubmission && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t.assignments.lateSubmissionsAllowed}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Submission Card */}
          {isStudent && (
            <Card>
              <CardHeader>
                <CardTitle>{t.assignments.yourSubmission}</CardTitle>
                <CardDescription>
                  {mySubmission?.status === "graded"
                    ? t.assignments.workGraded
                    : canSubmit
                    ? t.assignments.submitWorkBelow
                    : t.assignments.submissionsClosed}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mySubmission?.status === "graded" ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-sm whitespace-pre-wrap">{mySubmission.content}</p>
                      {mySubmission.attachments && mySubmission.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t.assignments.attachedFiles}</p>
                          <AttachmentList attachments={mySubmission.attachments} />
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{t.assignments.scoreDisplay}</span>
                        <Badge variant="secondary" className="text-base">
                          {mySubmission.score} / {assignment.maxScore}
                        </Badge>
                      </div>
                      {mySubmission.feedback && (
                        <div>
                          <span className="font-medium text-sm">{t.assignments.feedbackDisplay}</span>
                          <p className="text-sm text-muted-foreground mt-1">{mySubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isSubmitted ? (
                  /* Show read-only submitted content */
                  <div className="space-y-3">
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <p className="text-sm whitespace-pre-wrap">{mySubmission?.content}</p>
                      {mySubmission?.attachments && mySubmission.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{t.assignments.attachedFiles}</p>
                          <AttachmentList attachments={mySubmission.attachments} />
                        </div>
                      )}
                    </div>
                    {mySubmission?.submittedAt && (
                      <p className="text-xs text-muted-foreground">
                        {t.assignments.submittedAt} {format(new Date(mySubmission.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="content">{t.assignments.yourAnswer}</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t.assignments.answerPlaceholder}
                        rows={10}
                        disabled={!canSubmit || loading}
                        className="mt-2"
                      />
                    </div>

                    {/* PDF Attachment Section */}
                    {canSubmit && (
                      <div className="space-y-2">
                        <Label>{t.assignments.attachments}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            multiple
                            className="hidden"
                            disabled={loading || isUploading}
                            onChange={handleFilePick}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading || isUploading}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {isUploading ? (
                              <Loader2 className="size-4 mr-2 animate-spin" />
                            ) : (
                              <Paperclip className="size-4 mr-2" />
                            )}
                            {isUploading ? t.assignments.uploadingAttachment : t.assignments.attachFile}
                          </Button>
                          <span className="text-xs text-muted-foreground">{t.assignments.pdfOnly}</span>
                        </div>
                        <AttachmentList
                          attachments={attachments}
                          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
                        />
                      </div>
                    )}

                    {canSubmit && (
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={loading || isUploading || (!content.trim() && attachments.length === 0)}
                        >
                          <Send className="size-4 mr-2" />
                          {mySubmission?.status === "draft" ? t.assignments.submitAssignment : t.assignments.submit}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSaveDraft}
                          disabled={loading || isUploading || (!content.trim() && attachments.length === 0)}
                        >
                          <Save className="size-4 mr-2" />
                          {t.assignments.saveDraft}
                        </Button>
                      </div>
                    )}
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Teacher Submissions */}
          {isTeacher && (
            <Card>
              <CardHeader>
                <CardTitle>{t.assignments.studentSubmissions}</CardTitle>
                <CardDescription>
                  {submissions.length === 1
                    ? t.assignments.submissionsCount.replace("{{count}}", String(submissions.length))
                    : t.assignments.submissionsCountPlural.replace("{{count}}", String(submissions.length))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="size-12 mx-auto mb-2 opacity-50" />
                    <p>{t.assignments.noSubmissions}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((submission) => {
                      const statusInfo = getStatusInfo(submission.status, t)
                      const StatusIcon = statusInfo.icon
                      return (
                        <Card key={submission.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <User className="size-4 text-muted-foreground" />
                                <span className="font-medium text-sm">
                                  {t.assignments.studentId} {submission.studentId.slice(0, 8)}
                                </span>
                              </div>
                              <Badge variant={statusInfo.variant}>
                                <StatusIcon className="size-3 mr-1" />{statusInfo.label}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="rounded-lg border p-3 bg-muted/30">
                              <p className="text-sm whitespace-pre-wrap">{submission.content || t.common.none}</p>
                              {submission.attachments && submission.attachments.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">{t.assignments.attachedFiles}</p>
                                  <AttachmentList attachments={submission.attachments} />
                                </div>
                              )}
                            </div>
                            {submission.submittedAt && (
                              <p className="text-xs text-muted-foreground">
                                {t.assignments.submittedAt} {format(new Date(submission.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            )}
                            {submission.status === "graded" ? (
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{t.assignments.scoreDisplay}</span>
                                    <Badge variant="secondary">{submission.score} / {assignment.maxScore}</Badge>
                                  </div>
                                  {submission.feedback && (
                                    <p className="text-xs text-muted-foreground">
                                      {t.assignments.feedbackDisplay} {submission.feedback}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  variant="outline" size="sm"
                                  onClick={() => { setGradeDialog({ open: true, submission }); setGradeForm({ score: String(submission.score || ""), feedback: submission.feedback || "" }) }}
                                >
                                  {t.assignments.editGrade}
                                </Button>
                              </div>
                            ) : submission.status !== "draft" ? (
                              <Button
                                size="sm"
                                onClick={() => { setGradeDialog({ open: true, submission }); setGradeForm({ score: "", feedback: "" }) }}
                              >
                                <Award className="size-4 mr-2" />
                                {t.assignments.gradeSubmission}
                              </Button>
                            ) : null}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Grade Dialog */}
      <Dialog open={gradeDialog.open} onOpenChange={(open) => setGradeDialog({ open, submission: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.assignments.gradeSubmission}</DialogTitle>
            <DialogDescription>{t.assignments.gradeDesc}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGrade} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="score">{t.assignments.scoreLabel}</Label>
              <Input
                id="score" type="number"
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                placeholder={t.assignments.scorePlaceholder}
                min="0" max={assignment.maxScore}
                required
              />
              {assignment.maxScore && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.assignments.maximum.replace("{{n}}", String(assignment.maxScore))}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="feedback">{t.assignments.feedbackLabel}</Label>
              <Textarea
                id="feedback"
                value={gradeForm.feedback}
                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                placeholder={t.assignments.feedbackPlaceholder}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setGradeDialog({ open: false, submission: null })}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={loading}>{t.assignments.submitGrade}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

