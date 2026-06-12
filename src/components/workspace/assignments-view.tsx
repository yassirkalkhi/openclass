"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { getClassAssignmentsAction, createAssignmentAction, deleteAssignmentAction, getMySubmissionsForClassAction } from "@/app/actions/assignment"
import { useClass } from "@/context/class-context"
import type { Assignment, AssignmentSubmission } from "@/lib/types/database"
import { format, isPast, isFuture, isToday, differenceInDays } from "date-fns"
import { Plus, Calendar, FileText, Loader2, X, Circle, AlertCircle, Clock, CheckCircle2, Paperclip, FileIcon, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { useUploadThing } from "@/lib/uploadthing"

type SubmissionStatus = Pick<AssignmentSubmission, "assignmentId" | "status">

function getAssignmentStatus(
  assignment: Assignment,
  submission: SubmissionStatus | undefined
) {
   if (submission && submission.status !== "draft") {
    return {
      icon: CheckCircle2,
      styles: "text-emerald-500",
      label: submission.status,
    }
  }

   if (submission && submission.status === "draft") {
    return {
      icon: Circle,
      styles: "text-amber-400",
      label: "draft",
    }
  }

   if (!assignment.dueDate) {
    return { icon: Circle, styles: "text-muted-foreground/40 group-hover:text-muted-foreground/70", label: null }
  }
  const dueDate = new Date(assignment.dueDate)
  if (isPast(dueDate)) {
    return { icon: AlertCircle, styles: "text-destructive", label: null }
  }
  if (isToday(dueDate)) {
    return { icon: Clock, styles: "text-amber-500 animate-pulse", label: null }
  }
  if (differenceInDays(dueDate, new Date()) <= 3) {
    return { icon: Clock, styles: "text-amber-500", label: null }
  }
  return { icon: Circle, styles: "text-muted-foreground/40 group-hover:text-primary transition-colors", label: null }
}

export function AssignmentsView({ classSlug }: { classSlug: string }) {
  const { classData, membership } = useClass()
  const { t } = useI18n()
  const canCreate = membership.role === "teacher"
  const isStudent = membership.role === "student"
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissionMap, setSubmissionMap] = useState<Map<string, SubmissionStatus>>(new Map())
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Assignment | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "", description: "", dueDate: "", maxScore: "", allowLateSubmission: false,
  })
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])
  const [attachmentNames, setAttachmentNames] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("classFile", {
    onClientUploadComplete: (res: Array<{ serverData: unknown; url: string; name: string }>) => {
      const urls = res.map((f) => {
        const data = f.serverData as { fileUrl?: string } | undefined
        return data?.fileUrl ?? f.url
      })
      const names = res.map((f) => {
        const data = f.serverData as { fileName?: string } | undefined
        return data?.fileName ?? f.name
      })
      setAttachmentUrls((prev) => [...prev, ...urls])
      setAttachmentNames((prev) => [...prev, ...names])
    },
    onUploadError: (err: Error) => {
      console.error("Upload error:", err.message)
    },
  })

  useEffect(() => {
    if (showDialog) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [showDialog])

  function load() {
    setLoading(true)
    const fetches: Promise<void>[] = [
      getClassAssignmentsAction(classData.id).then((r) => {
        if (r.success && r.data) setAssignments(r.data)
      }),
    ]
    if (isStudent) {
      fetches.push(
        getMySubmissionsForClassAction(classData.id).then((r) => {
          if (r.success && r.data) {
            setSubmissionMap(new Map(r.data.map((s) => [s.assignmentId, s])))
          }
        })
      )
    }
    Promise.all(fetches).then(() => setLoading(false))
  }

  useEffect(() => { load() }, [classData.id])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await createAssignmentAction({
      classId: classData.id,
      title: formData.title,
      description: formData.description || undefined,
      attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      attachmentNames: attachmentNames.length > 0 ? attachmentNames : undefined,
      dueDate: formData.dueDate || undefined,
      maxScore: formData.maxScore ? Number(formData.maxScore) : undefined,
      allowLateSubmission: formData.allowLateSubmission,
    })
    setIsSubmitting(false)
    if (result.success) {
      setShowDialog(false)
      setFormData({ title: "", description: "", dueDate: "", maxScore: "", allowLateSubmission: false })
      setAttachmentUrls([])
      setAttachmentNames([])
      load()
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const result = await deleteAssignmentAction(deleteTarget.id)
    setDeleting(false)
    if (result.success) {
      setDeleteTarget(null)
      load()
    }
  }

  const upcoming = assignments.filter((a) => !a.dueDate || isFuture(new Date(a.dueDate)))
  const pastDue = assignments.filter((a) => a.dueDate && isPast(new Date(a.dueDate)))
  return (
    <div className="flex h-full flex-col bg-muted/30 text-foreground antialiased">
      {/* Top Header Section */}
      <div className="px-8 py-6 bg-background border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t.assignments.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canCreate ? t.assignments.createManage : t.assignments.viewSubmit}
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 gap-2 shadow"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {t.assignments.createNew}
          </button>
        )}
      </div>

      {/* Checklist View Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Fetching checklist records...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
            <div className="p-3.5 bg-background rounded-full border border-border shadow-sm mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{t.assignments.noAssignments}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {canCreate ? t.assignments.noAssignmentsTeacher : t.assignments.noAssignmentsStudent}
            </p>
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl">
            {/* Active To-Do Section */}
            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
                  <span>{t.assignments.active}</span>
                  <span className="bg-background border text-[10px] text-muted-foreground px-1.5 py-0.2 rounded-full font-bold shadow-sm">
                    {upcoming.length}
                  </span>
                </h2>
                
                <div className="space-y-2.5">
                  {upcoming.map((a) => {
                    const status = getAssignmentStatus(a, submissionMap.get(a.id))
                    const StatusIcon = status.icon
                    const isSubmitted = status.label && status.label !== "draft"
                    return (
                      <div key={a.id} className="group relative">
                        <Link href={`/app/${classSlug}/assignments/${a.id}`} className="block">
                          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80 hover:bg-accent/5 active:scale-[0.99] transform-gpu">
                            
                            {/* To-Do Check Indicator */}
                            <div className="pt-0.5 shrink-0">
                              <StatusIcon className={`w-5 h-5 stroke-[2] ${status.styles}`} />
                            </div>

                            {/* Task Content Stack */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className={`text-sm font-medium tracking-tight transition-colors truncate ${isSubmitted ? "text-muted-foreground line-through decoration-muted-foreground/40" : "text-foreground group-hover:text-primary"}`}>
                                {a.title}
                              </h4>
                              {a.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-xl">
                                  {a.description}
                                </p>
                              )}
                              
                              {/* Metadata Badges line */}
                              <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground/80 font-medium">
                                {a.dueDate && (
                                  <span className={`flex items-center gap-1 ${isToday(new Date(a.dueDate)) ? "text-amber-600 dark:text-amber-400 font-semibold" : ""}`}>
                                    <Calendar className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                    <span>{t.assignments.due} {format(new Date(a.dueDate), "MMM d, h:mm a")}</span>
                                  </span>
                                )}
                                {a.maxScore !== undefined && (
                                  <span className="flex items-center gap-1 before:content-['•'] before:opacity-30 before:mr-1">
                                    <span>{a.maxScore} pts</span>
                                  </span>
                                )}
                                {a.allowLateSubmission && (
                                  <span className="text-[10px] text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
                                    Late OK
                                  </span>
                                )}
                                {isSubmitted && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                    {status.label === "graded" ? t.assignments.graded : t.assignments.submitted}
                                  </span>
                                )}
                                {status.label === "draft" && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                                    {t.assignments.draft}
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        </Link>
                        {canCreate && (
                          <button
                            onClick={(e) => { e.preventDefault(); setDeleteTarget(a) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={t.assignments.deleteAssignment}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Completed / Past Due To-Do Section */}
            {pastDue.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
                  <span>{t.assignments.pastDue}</span>
                  <span className="bg-background border text-[10px] text-muted-foreground px-1.5 py-0.2 rounded-full font-bold shadow-sm">
                    {pastDue.length}
                  </span>
                </h2>
                
                <div className="space-y-2.5 opacity-70 hover:opacity-100 transition-opacity duration-150">
                  {pastDue.map((a) => {
                    const submission = submissionMap.get(a.id)
                    const isSubmitted = submission && submission.status !== "draft"
                    return (
                      <div key={a.id} className="group relative">
                        <Link href={`/app/${classSlug}/assignments/${a.id}`} className="block">
                          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-background/80 shadow-sm transition-all duration-150 hover:bg-background hover:border-border transform-gpu">
                            
                            {/* Past Due / Submitted indicator */}
                            <div className="pt-0.5 shrink-0">
                              {isSubmitted ? (
                                <CheckCircle2 className="w-5 h-5 stroke-[2] text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 stroke-[2] text-destructive/60 group-hover:text-destructive transition-colors" />
                              )}
                            </div>

                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className={`text-sm font-medium tracking-tight transition-colors truncate line-through ${isSubmitted ? "decoration-emerald-400/50 text-muted-foreground group-hover:text-foreground" : "decoration-muted-foreground/30 text-muted-foreground group-hover:text-foreground"}`}>
                                {a.title}
                              </h4>
                              <div className="flex items-center gap-3 pt-0.5 text-[11px] text-muted-foreground/60 font-medium">
                                {a.dueDate && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                    <span>Closed {format(new Date(a.dueDate), "MMM d")}</span>
                                  </span>
                                )}
                                {a.maxScore !== undefined && (
                                  <span className="flex items-center gap-1 before:content-['•'] before:opacity-30 before:mr-1">
                                    <span>{a.maxScore} pts</span>
                                  </span>
                                )}
                                {isSubmitted && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                    {submission.status === "graded" ? t.assignments.graded : t.assignments.submitted}
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        </Link>
                        {canCreate && (
                          <button
                            onClick={(e) => { e.preventDefault(); setDeleteTarget(a) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label={t.assignments.deleteAssignment}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creation Modal Container */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            onClick={() => { setShowDialog(false); setAttachmentUrls([]); setAttachmentNames([]) }} 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in-0" 
          />
          
          <div className="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-xl duration-200 animate-in fade-in-0 zoom-in-95 rounded-2xl md:w-full">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <h3 className="text-lg font-semibold leading-none tracking-tight">{t.assignments.create}</h3>
              <p className="text-sm text-muted-foreground">{t.assignments.descriptionPlaceholder}</p>
            </div>
            
            <button 
              onClick={() => { setShowDialog(false); setAttachmentUrls([]); setAttachmentNames([]) }}
              className="absolute right-4 top-4 rounded-full p-1 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium leading-none">
                  {t.assignments.titleLabel}
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t.assignments.titlePlaceholder}
                  required
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium leading-none">
                  {t.assignments.descriptionLabel}
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.assignments.descriptionPlaceholder}
                  rows={3}
                  disabled={isSubmitting}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-medium leading-none">
                    {t.assignments.dueDateLabel}
                  </label>
                  <input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxScore" className="text-sm font-medium leading-none">
                    {t.assignments.maxScorePoints}
                  </label>
                  <input
                    id="maxScore"
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    placeholder="100"
                    min="0"
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* PDF Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">{t.assignments.attachments}</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    multiple
                    className="hidden"
                    disabled={isSubmitting || isUploading}
                    onChange={async (e) => {
                      const files = e.target.files
                      if (!files?.length) return
                      const pdfs = Array.from(files).filter((f) => f.type === "application/pdf")
                      if (!pdfs.length) return
                      await startUpload(pdfs, { classId: classData.id })
                      e.target.value = ""
                    }}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 transition-colors"
                  >
                    {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
                    {isUploading ? t.assignments.uploadingAttachment : t.assignments.attachFile}
                  </button>
                  <span className="text-xs text-muted-foreground">{t.assignments.pdfOnly}</span>
                </div>
                {attachmentNames.length > 0 && (
                  <ul className="space-y-1.5 mt-1">
                    {attachmentNames.map((name, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAttachmentUrls((prev) => prev.filter((_, j) => j !== i))
                            setAttachmentNames((prev) => prev.filter((_, j) => j !== i))
                          }}
                          className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label={t.assignments.removeAttachment}
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Form Footer Action layout */}
              <div className="pt-4 flex items-center justify-between border-t border-border mt-4">                <div className="flex items-center space-x-2">
                  <input
                    id="allowLate"
                    type="checkbox"
                    checked={formData.allowLateSubmission}
                    onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                    disabled={isSubmitting}
                    className="h-4 w-4 shrink-0 rounded border-primary bg-background text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 accent-primary cursor-pointer"
                  />
                  <label htmlFor="allowLate" className="text-sm font-medium leading-none cursor-pointer select-none">
                    {t.assignments.allowLateSubmissions}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowDialog(false); setAttachmentUrls([]); setAttachmentNames([]) }}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 min-w-[70px]"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t.assignments.create}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            onClick={() => { if (!deleting) setDeleteTarget(null) }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="relative z-50 w-full max-w-md border bg-background p-6 shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95">
            <h3 className="text-lg font-semibold text-destructive mb-2">{t.assignments.deleteAssignmentConfirmTitle}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t.assignments.deleteAssignmentConfirmDesc}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-full text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 disabled:opacity-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 justify-center rounded-full text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? t.assignments.deleting : t.assignments.deleteAssignmentConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}