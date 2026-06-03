"use client"

import { useEffect, useState, useTransition } from "react"
import {
  getClassResourcesAction,
  getClassChaptersAction,
  uploadResourceAction,
  deleteResourceAction,
  indexResourceAction,
  createChapterAction,
  updateChapterAction,
  deleteChapterAction,
  moveResourceToChapterAction,
} from "@/app/actions/resource"
import { useClass } from "@/context/class-context"
import { usePermission } from "@/hooks/use-permission"
import type { ClassResource, ResourceChapter } from "@/lib/types/database"
import { FileUpload } from "@/components/upload/file-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, Sparkles, Trash2, FileText, FileImage, File,
  Upload, Search, MoreVertical, ExternalLink, ChevronDown,
  ChevronRight, FolderOpen, FolderPlus, Pencil, BookOpen,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isIndexable(r: ClassResource) {
  const t = r.fileType.toLowerCase()
  const n = r.title.toLowerCase()
  return t.includes("pdf") || n.endsWith(".pdf") || t.startsWith("text/") || n.endsWith(".txt") || n.endsWith(".md")
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()
  if (type.includes("pdf")) return <img src="/pdf.png" alt="PDF" className="size-8 object-contain" />
  if (type.startsWith("image/")) return <FileImage className="size-4 text-blue-500" />
  return <File className="size-4 text-muted-foreground" />
}

function isImage(fileType: string) { return fileType.toLowerCase().startsWith("image/") }

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

interface UploadDialogProps {
  classId: string
  chapterId?: string
  chapters: ResourceChapter[]
  disabled?: boolean
  onDone: () => void
  trigger: React.ReactNode
}

function UploadDialog({ classId, chapterId, chapters, disabled, onDone, trigger }: UploadDialogProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapterId ?? "__none__")
  const [pending, startTransition] = useTransition()

  useEffect(() => { setSelectedChapterId(chapterId ?? "__none__") }, [chapterId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.resources.uploadResource}</DialogTitle>
          <DialogDescription>{t.resources.uploadResourceDesc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.resources.resourceTitle}</label>
            <Input
              placeholder={t.resources.resourceTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {chapters.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t.resources.chapter}</label>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
              >
                <option value="__none__">{t.resources.uncategorized}</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.resources.selectFile}</label>
            <FileUpload
              classId={classId}
              disabled={!title.trim() || pending || disabled}
              label={t.resources.chooseFile}
              className="w-full"
              onUploaded={async (file) => {
                startTransition(async () => {
                  await uploadResourceAction({
                    classId,
                    title: title || file.fileName,
                    fileName: file.fileName,
                    fileUrl: file.fileUrl,
                    fileType: file.fileType,
                    fileSize: file.fileSize,
                    chapterId: selectedChapterId === "__none__" ? undefined : selectedChapterId,
                  })
                  setTitle("")
                  setOpen(false)
                  onDone()
                })
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Chapter Form Dialog ──────────────────────────────────────────────────────

interface ChapterDialogProps {
  classId: string
  chapter?: ResourceChapter      // if provided → edit mode
  trigger: React.ReactNode       // null = controlled externally
  onDone: () => void
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
}

function ChapterDialog({ classId, chapter, trigger, onDone, externalOpen, onExternalOpenChange }: ChapterDialogProps) {
  const { t } = useI18n()
  const [internalOpen, setInternalOpen] = useState(false)
  const [title, setTitle] = useState(chapter?.title ?? "")
  const [description, setDescription] = useState(chapter?.description ?? "")
  const [pending, startTransition] = useTransition()

  // Support both self-controlled (trigger) and externally-controlled (externalOpen) modes
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen

  function setOpen(v: boolean) {
    if (isControlled) {
      onExternalOpenChange?.(v)
    } else {
      setInternalOpen(v)
    }
    // Sync form fields when opening in edit mode
    if (v && chapter) {
      setTitle(chapter.title)
      setDescription(chapter.description ?? "")
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      if (chapter) {
        await updateChapterAction(chapter.id, { title, description: description || undefined })
      } else {
        await createChapterAction({ classId, title, description: description || undefined })
      }
      setOpen(false)
      setTitle("")
      setDescription("")
      onDone()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{chapter ? t.resources.editChapter : t.resources.addChapter}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.resources.chapterTitle}</label>
            <Input
              placeholder={t.resources.chapterTitlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.resources.chapterDescription}</label>
            <Input
              placeholder={t.resources.chapterDescriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              {chapter ? t.common.save : t.common.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Resource Row ─────────────────────────────────────────────────────────────

interface ResourceRowProps {
  resource: ClassResource
  chapters: ResourceChapter[]
  canManage: boolean
  indexingId: string | null
  justIndexed: string | null
  onIndex: (id: string) => void
  onDelete: (id: string) => void
  onMove: (resourceId: string, chapterId: string | null) => void
}

function ResourceRow({
  resource: r,
  chapters,
  canManage,
  indexingId,
  justIndexed,
  onIndex,
  onDelete,
  onMove,
}: ResourceRowProps) {
  const { t } = useI18n()
  const isPdf = r.fileType.toLowerCase().includes("pdf")

  return (
    <div
      className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2 hover:bg-muted/40 transition-colors cursor-pointer relative"
      onClick={() => window.open(r.fileUrl, "_blank", "noopener,noreferrer")}
    >
      {/* Thumbnail — no border/bg for PDFs since the png has its own design */}
      <div className={cn(
        "size-9 shrink-0 flex items-center justify-center overflow-hidden",
        !isPdf && !isImage(r.fileType) && "rounded-md border bg-muted/50",
        isImage(r.fileType) && "rounded-md border overflow-hidden bg-muted/50",
      )}>
        {isImage(r.fileType)
          ? <img src={r.fileUrl} alt={r.title} className="w-full h-full object-cover" />
          : getFileIcon(r.fileType)
        }
      </div>

      {/* Info — takes remaining space, right-padded just enough for the button */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{r.title}</p>
          {r.aiIndexed && (
            <Badge variant="secondary" className={cn(
              "text-[8px] h-3.5 px-1 shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
              justIndexed === r.id && "animate-in zoom-in-95"
            )}>
              <Sparkles className="size-2 mr-0.5" />AI
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground truncate">
          {r.fileName} · {formatFileSize(r.fileSize)}
        </p>
      </div>

      {/* Indexing overlay */}
      {indexingId === r.id && (
        <div
          className="absolute inset-0 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Loader2 className="size-3.5 animate-spin text-primary mr-1.5" />
          <span className="text-[11px] text-muted-foreground">{t.resources.indexing}</span>
        </div>
      )}

      {/* Actions — flex item, always reserves space, button visible on hover */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => window.open(r.fileUrl, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="size-3.5 mr-2" />{t.resources.view}
            </DropdownMenuItem>
            {isIndexable(r) && !r.aiIndexed && (
              <DropdownMenuItem onClick={() => onIndex(r.id)}>
                <Sparkles className="size-3.5 mr-2 text-purple-500" />{t.resources.indexForAI}
              </DropdownMenuItem>
            )}
            {canManage && chapters.length > 0 && (
              <>
                <DropdownMenuSeparator />
                {r.chapterId && (
                  <DropdownMenuItem onClick={() => onMove(r.id, null)}>
                    <FolderOpen className="size-3.5 mr-2" />{t.resources.moveToUncategorized}
                  </DropdownMenuItem>
                )}
                {chapters.filter((c) => c.id !== r.chapterId).map((c) => (
                  <DropdownMenuItem key={c.id} onClick={() => onMove(r.id, c.id)}>
                    <BookOpen className="size-3.5 mr-2" />{c.title}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(r.id)}>
                  <Trash2 className="size-3.5 mr-2" />{t.common.delete}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ─── Chapter Section ──────────────────────────────────────────────────────────

interface ChapterSectionProps {
  chapter: ResourceChapter | null   // null = Uncategorized bucket
  resources: ClassResource[]
  allChapters: ResourceChapter[]
  canManage: boolean
  showUpload: boolean
  classId: string
  indexingId: string | null
  justIndexed: string | null
  onRefresh: () => void
  onIndex: (id: string) => void
  onDelete: (id: string) => void
  onMove: (resourceId: string, chapterId: string | null) => void
  onDeleteChapter: (chapterId: string) => void
}

function ChapterSection({
  chapter,
  resources,
  allChapters,
  canManage,
  showUpload,
  classId,
  indexingId,
  justIndexed,
  onRefresh,
  onIndex,
  onDelete,
  onMove,
  onDeleteChapter,
}: ChapterSectionProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const isUncategorized = chapter === null
  const fileCount = resources.length

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Edit chapter dialog — rendered outside the dropdown so it survives dropdown close */}
      {!isUncategorized && chapter && (
        <ChapterDialog
          classId={classId}
          chapter={chapter}
          externalOpen={editOpen}
          onExternalOpenChange={setEditOpen}
          trigger={null}
          onDone={onRefresh}
        />
      )}

      {/* Chapter header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-muted-foreground">
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </span>
        <BookOpen className={cn("size-4 shrink-0", isUncategorized ? "text-muted-foreground" : "text-primary")} />
        <span className="font-semibold text-sm flex-1 truncate">
          {isUncategorized ? t.resources.uncategorized : chapter.title}
        </span>
        {chapter?.description && (
          <span className="text-[11px] text-muted-foreground hidden md:block truncate max-w-[200px]">{chapter.description}</span>
        )}
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
          {fileCount} {fileCount === 1 ? t.common.file : t.common.files}
        </Badge>

        {/* Chapter actions — only for named chapters */}
        {!isUncategorized && canManage && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6 ml-1 opacity-60 hover:opacity-100">
                  <MoreVertical className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil className="size-3.5 mr-2" />{t.resources.editChapter}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDeleteChapter(chapter!.id)}
                >
                  <Trash2 className="size-3.5 mr-2" />{t.resources.deleteChapter}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Upload button inside chapter header */}
        {showUpload && (
          <div onClick={(e) => e.stopPropagation()}>
            <UploadDialog
              classId={classId}
              chapterId={chapter?.id}
              chapters={allChapters}
              onDone={onRefresh}
              trigger={
                <Button variant="ghost" size="icon" className="size-6 opacity-60 hover:opacity-100" title={t.resources.uploadToChapter}>
                  <Upload className="size-3.5" />
                </Button>
              }
            />
          </div>
        )}
      </div>

      {/* File list */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-2">
          {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed bg-muted/20">
              <File className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">{t.resources.noResources}</p>
              {showUpload && (
                <UploadDialog
                  classId={classId}
                  chapterId={chapter?.id}
                  chapters={allChapters}
                  onDone={onRefresh}
                  trigger={
                    <Button variant="outline" size="sm" className="mt-3 h-7 text-xs gap-1.5">
                      <Upload className="size-3" />{t.resources.uploadFirst}
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            resources.map((r) => (
              <ResourceRow
                key={r.id}
                resource={r}
                chapters={allChapters}
                canManage={canManage}
                indexingId={indexingId}
                justIndexed={justIndexed}
                onIndex={onIndex}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ResourcesView() {
  const { classData, settings, membership } = useClass()
  const { t } = useI18n()
  const canUpload = usePermission("upload_files")
  const canManage = usePermission("manage_class")

  const [resources, setResources] = useState<ClassResource[]>([])
  const [chapters, setChapters] = useState<ResourceChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [indexingId, setIndexingId] = useState<string | null>(null)
  const [justIndexed, setJustIndexed] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const studentUploadAllowed = membership.role !== "student" || settings?.allowStudentUploads !== false
  const showUpload = canUpload && studentUploadAllowed

  function load() {
    setLoading(true)
    Promise.all([
      getClassResourcesAction(classData.id),
      getClassChaptersAction(classData.id),
    ]).then(([rRes, cRes]) => {
      if (rRes.success && rRes.data) setResources(rRes.data)
      if (cRes.success && cRes.data) setChapters(cRes.data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [classData.id])

  function handleIndex(resourceId: string) {
    setIndexingId(resourceId)
    setJustIndexed(null)
    startTransition(async () => {
      await indexResourceAction(resourceId)
      setIndexingId(null)
      setJustIndexed(resourceId)
      setTimeout(() => setJustIndexed(null), 3000)
      load()
    })
  }

  function handleDelete(resourceId: string) {
    if (!confirm(t.resources.deleteResource)) return
    startTransition(async () => { await deleteResourceAction(resourceId); load() })
  }

  function handleDeleteChapter(chapterId: string) {
    if (!confirm(t.resources.deleteChapterDesc)) return
    startTransition(async () => { await deleteChapterAction(chapterId); load() })
  }

  function handleMove(resourceId: string, chapterId: string | null) {
    startTransition(async () => { await moveResourceToChapterAction(resourceId, chapterId); load() })
  }

  // Apply search filter
  const filteredResources = searchQuery
    ? resources.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fileType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : resources

  // Build chapter → resources map
  const resourcesByChapter = new Map<string, ClassResource[]>()
  const uncategorized: ClassResource[] = []
  for (const r of filteredResources) {
    if (r.chapterId) {
      const arr = resourcesByChapter.get(r.chapterId) ?? []
      arr.push(r)
      resourcesByChapter.set(r.chapterId, arr)
    } else {
      uncategorized.push(r)
    }
  }

  const totalFiles = resources.length

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ── */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{t.resources.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chapters.length} {chapters.length === 1 ? t.resources.chapter : t.resources.chapters}
              {" · "}
              {totalFiles} {totalFiles === 1 ? t.common.file : t.common.files}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <ChapterDialog
                classId={classData.id}
                onDone={load}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <FolderPlus className="size-3.5" />
                    {t.resources.newChapter}
                  </Button>
                }
              />
            )}
            {showUpload && (
              <UploadDialog
                classId={classData.id}
                chapters={chapters}
                onDone={load}
                trigger={
                  <Button size="sm" className="gap-1.5 h-8">
                    <Upload className="size-3.5" />
                    {t.resources.upload}
                  </Button>
                }
              />
            )}
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Input
              placeholder={t.resources.searchFiles}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {!showUpload && membership.role === "student" && (
        <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-2.5">
          <p className="text-xs text-amber-800 dark:text-amber-200">{t.resources.studentUploadsDisabled}</p>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : chapters.length === 0 && resources.length === 0 ? (
            /* Empty state — no chapters at all */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="size-14 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-sm mb-1">{t.resources.noChapters}</h3>
              <p className="text-xs text-muted-foreground max-w-xs">{t.resources.noChaptersDesc}</p>
              {canManage && (
                <ChapterDialog
                  classId={classData.id}
                  onDone={load}
                  trigger={
                    <Button size="sm" className="mt-4 gap-1.5">
                      <FolderPlus className="size-3.5" />
                      {t.resources.createFirstChapter}
                    </Button>
                  }
                />
              )}
            </div>
          ) : searchQuery && filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="size-10 text-muted-foreground/40 mb-3" />
              <h3 className="font-medium text-sm mb-0.5">{t.resources.noResults}</h3>
              <p className="text-xs text-muted-foreground">{t.resources.tryAdjusting}</p>
            </div>
          ) : (
            <>
              {/* Named chapters */}
              {chapters.map((chapter) => (
                <ChapterSection
                  key={chapter.id}
                  chapter={chapter}
                  resources={resourcesByChapter.get(chapter.id) ?? []}
                  allChapters={chapters}
                  canManage={canManage}
                  showUpload={showUpload}
                  classId={classData.id}
                  indexingId={indexingId}
                  justIndexed={justIndexed}
                  onRefresh={load}
                  onIndex={handleIndex}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onDeleteChapter={handleDeleteChapter}
                />
              ))}

              {/* Uncategorized bucket — shown when there are uncategorized files OR no chapters yet */}
              {(uncategorized.length > 0 || chapters.length === 0) && (
                <ChapterSection
                  chapter={null}
                  resources={uncategorized}
                  allChapters={chapters}
                  canManage={canManage}
                  showUpload={showUpload}
                  classId={classData.id}
                  indexingId={indexingId}
                  justIndexed={justIndexed}
                  onRefresh={load}
                  onIndex={handleIndex}
                  onDelete={handleDelete}
                  onMove={handleMove}
                  onDeleteChapter={handleDeleteChapter}
                />
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
