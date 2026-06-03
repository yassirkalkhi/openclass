import { readFile } from "fs/promises"
import path from "path"
import { extractText, getDocumentProxy } from "unpdf"
import { ResourceRepository } from "@/lib/repositories/resource-repository"
import { AIService } from "./ai-service"

const CHUNK_MAX_CHARS = 1200
const CHUNK_OVERLAP = 150

const aiService = new AIService()
const resourceRepository = new ResourceRepository()

function isPdfType(fileType: string, fileName?: string): boolean {
  const t = fileType.toLowerCase()
  if (t.includes("pdf")) return true
  return fileName?.toLowerCase().endsWith(".pdf") ?? false
}

function isPlainTextType(fileType: string, fileName?: string): boolean {
  const t = fileType.toLowerCase()
  if (t.startsWith("text/")) return true
  const name = fileName?.toLowerCase() ?? ""
  return name.endsWith(".txt") || name.endsWith(".md")
}

export function chunkDocumentText(
  text: string,
  mediaId: string
): Array<{ chunkText: string; embeddingId: string; metadata?: Record<string, unknown> }> {
  const normalized = text.replace(/\r\n/g, "\n").trim()
  if (!normalized) return []

  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  const chunks: Array<{
    chunkText: string
    embeddingId: string
    metadata?: Record<string, unknown>
  }> = []
  let buffer = ""
  let index = 0

  const flush = () => {
    if (!buffer.trim()) return
    chunks.push({
      chunkText: buffer.trim(),
      embeddingId: `${mediaId}-chunk-${index++}`,
      metadata: { mediaId },
    })
    buffer = ""
  }

  const pushSlice = (slice: string) => {
    chunks.push({
      chunkText: slice.trim(),
      embeddingId: `${mediaId}-chunk-${index++}`,
      metadata: { mediaId },
    })
  }

  for (const paragraph of paragraphs) {
    if (paragraph.length > CHUNK_MAX_CHARS) {
      flush()
      for (let i = 0; i < paragraph.length; i += CHUNK_MAX_CHARS - CHUNK_OVERLAP) {
        pushSlice(paragraph.slice(i, i + CHUNK_MAX_CHARS))
      }
      continue
    }

    const next = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    if (next.length <= CHUNK_MAX_CHARS) {
      buffer = next
    } else {
      flush()
      buffer = paragraph
    }
  }

  flush()
  return chunks
}

async function loadFileBytes(fileUrl: string): Promise<Buffer> {
  if (fileUrl.startsWith("/uploads/")) {
    const localPath = path.join(process.cwd(), "public", fileUrl)
    return readFile(localPath)
  }

  let resolvedUrl = fileUrl
  if (fileUrl.startsWith("/")) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    resolvedUrl = `${baseUrl}${fileUrl}`
  }

  const res = await fetch(resolvedUrl)
  if (!res.ok) {
    throw new Error(`Failed to fetch file (${res.status})`)
  }
  return Buffer.from(await res.arrayBuffer())
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  if (typeof text === "string") return text
  return (text as string[]).join("\n\n")
}

async function extractPlainText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8")
}

export class DocumentIndexingService {
  async indexResource(
    classId: string,
    resourceId: string,
    fileUrl: string,
    fileType: string,
    fileName?: string
  ): Promise<{ chunkCount: number }> {
    if (!isPdfType(fileType, fileName) && !isPlainTextType(fileType, fileName)) {
      throw new Error("Only PDF and plain-text files can be indexed for AI")
    }

    await aiService.deleteEmbeddingChunks(classId, resourceId)

    const bytes = await loadFileBytes(fileUrl)
    const rawText = isPdfType(fileType, fileName)
      ? await extractPdfText(bytes)
      : await extractPlainText(bytes)

    const chunks = chunkDocumentText(rawText, resourceId)
    if (chunks.length === 0) {
      throw new Error("No extractable text found in document")
    }

    await aiService.storeEmbeddingChunks(classId, resourceId, chunks)
    await resourceRepository.markAsIndexed(resourceId)

    return { chunkCount: chunks.length }
  }

  async removeResourceIndex(classId: string, resourceId: string): Promise<void> {
    await aiService.deleteEmbeddingChunks(classId, resourceId)
  }
}
