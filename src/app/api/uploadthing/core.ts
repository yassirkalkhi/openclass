import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { z } from "zod"
import { verifyToken } from "@/lib/jwt"
import { PermissionService } from "@/lib/services/permission-service"

const f = createUploadthing()
const permissionService = new PermissionService()

function getTokenFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie")
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === "token") return decodeURIComponent(rest.join("="))
  }
  return null
}

async function authenticateUpload(req: Request, classId: string) {
  const token = getTokenFromRequest(req)
  if (!token) throw new UploadThingError("Unauthorized")

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.id
  } catch {
    throw new UploadThingError("Unauthorized")
  }

  await permissionService.requirePermission(classId, userId, "upload_files")
  return { userId, classId }
}

export const uploadRouter = {
  classFile: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    text: { maxFileSize: "4MB", maxFileCount: 5 },
    blob: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .input(z.object({ classId: z.string().min(1) }))
    .middleware(async ({ req, input }) => {
      const auth = await authenticateUpload(req, input.classId)
      return auth
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        fileUrl: file.ufsUrl ?? file.url,
        fileName: file.name,
        fileType: file.type ?? "application/octet-stream",
        fileSize: file.size,
        classId: metadata.classId,
        uploadedBy: metadata.userId,
      }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
