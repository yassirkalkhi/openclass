import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { verifyToken } from "@/lib/jwt"
import { PermissionService } from "@/lib/services/permission-service"

const permissionService = new PermissionService()

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.id
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const classId = formData.get("classId") as string | null

  if (!file || !classId) {
    return NextResponse.json({ error: "Missing file or classId" }, { status: 400 })
  }

  try {
    await permissionService.requirePermission(classId, userId, "upload_files")
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const dir = path.join(process.cwd(), "public", "uploads", userId)
  await mkdir(dir, { recursive: true })
  const filename = `${Date.now()}-${safeName}`
  await writeFile(path.join(dir, filename), buffer)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const fileUrl = `${baseUrl}/uploads/${userId}/${filename}`

  return NextResponse.json({
    fileUrl,
    fileName: file.name,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
  })
}
