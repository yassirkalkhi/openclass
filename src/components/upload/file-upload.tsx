"use client"

import "@uploadthing/react/styles.css"
import { useRef, useState } from "react"
import { Upload, Loader2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUploadThing, type UploadedFileResult } from "@/lib/uploadthing"

type UploadResult = UploadedFileResult

 const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]

export function FileUpload({
  classId,
  onUploaded,
  onUploadComplete,
  disabled,
  className,
  label = "Upload file",
  multiple = false,
}: {
  classId: string
  onUploaded?: (result: UploadResult) => void
  onUploadComplete?: (results: UploadResult[]) => void
  disabled?: boolean
  className?: string
  label?: string
  multiple?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const { startUpload, isUploading } = useUploadThing("classFile", {
    onClientUploadComplete: (res) => {
      const mapped: UploadResult[] = res.map((file) => {
        const data = file.serverData as UploadResult | undefined
        return {
          fileUrl: data?.fileUrl ?? file.url,
          fileName: data?.fileName ?? file.name,
          fileType: data?.fileType ?? file.type ?? "application/octet-stream",
          fileSize: data?.fileSize ?? file.size,
        }
      })
      if (mapped[0] && onUploaded) onUploaded(mapped[0])
      if (onUploadComplete) onUploadComplete(mapped)
      setError(null)
    },
    onUploadError: (err) => {
      setError(err.message)
    },
  })

  async function handleFiles(files: FileList | null) {
    if (!files?.length || disabled || isUploading) return
    setError(null)

     const rawList = multiple ? Array.from(files) : [files[0]]

     const invalidFiles = rawList.filter((file) => !ALLOWED_TYPES.includes(file.type))
    
    if (invalidFiles.length > 0) {
      setError("Invalid file format. Only images, and documents")
      return
    }

    try {
      await startUpload(rawList, { classId })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    }
  }

  return (
    <div className={cn("flex  gap-1 h-10")}>
       {error && <p className="self-end text-[10px]  position-absolute text-destructive mt-0.5 font-medium pb-1 pe-2">{error}</p>}
     <div>
       <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        disabled={disabled || isUploading}
        accept="image/*,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(className, "w-30")}
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Paperclip className="size-4 text-primary/50 animate-pulse" />
        ) : (
          <Paperclip className="size-4" />
        )}
        {isUploading ? "Uploading…" : label}
      </Button>
     </div>
     
     
    </div>
  )
}