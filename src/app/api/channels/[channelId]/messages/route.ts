import { NextRequest } from "next/server"
import { db } from "@/lib/firebase/firebase-admin"
import { getAuthCookie } from "@/lib/cookies"
import { verifyToken } from "@/lib/jwt"
import { ChannelRepository } from "@/lib/repositories/channel-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import type { Message } from "@/lib/types/database"

const channelRepo = new ChannelRepository()
const profileRepo = new ProfileRepository()

 
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params

  // ── Auth ────────────────────────────────────────────────────────────────────
  const token = await getAuthCookie()
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.id
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }

  // ── Channel / membership check ───────────────────────────────────────────────
  const channel = await channelRepo.getById(channelId)
  if (!channel) {
    return new Response("Channel not found", { status: 404 })
  }

   const memberSnap = await db
    .collection("classMembers")
    .where("classId", "==", channel.classId)
    .where("userId", "==", userId)
    .limit(1)
    .get()

  if (memberSnap.empty) {
    return new Response("Forbidden", { status: 403 })
  }

   const profileCache = new Map<string, object>()

  async function enrichSenderProfile(senderId: string) {
    if (!profileCache.has(senderId)) {
      const profile = await profileRepo.getById(senderId)
      if (profile) profileCache.set(senderId, profile)
    }
    return profileCache.get(senderId)
  }

  // ── SSE stream ───────────────────────────────────────────────────────────────
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      function send(event: string, data: unknown) {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        } catch {
          // Client already disconnected
        }
      }

      // Immediately confirm the stream is live
      send("connected", { channelId })

      
      const knownIds = new Set<string>()

      const unsubscribe = db
        .collection("messages")
        .where("channelId", "==", channelId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .onSnapshot(
          async (snapshot) => {
            // Process document changes
            const addedOrModified: Message[] = []
            const deletedIds: string[] = []

            for (const change of snapshot.docChanges()) {
              if (change.type === "added" || change.type === "modified") {
                addedOrModified.push(change.doc.data() as Message)
                knownIds.add(change.doc.id)
              } else if (change.type === "removed") {
                deletedIds.push(change.doc.id)
                knownIds.delete(change.doc.id)
              }
            }

             await Promise.all(
              addedOrModified.map((msg) => enrichSenderProfile(msg.senderId))
            )

            for (const msg of addedOrModified) {
              const senderProfile = profileCache.get(msg.senderId)
              send("message", { ...msg, senderProfile })
            }

            for (const id of deletedIds) {
              send("deleted", { id })
            }
          },
          (error) => {
            console.error("[SSE] Firestore onSnapshot error:", error)
            try {
              controller.close()
            } catch {
              // already closed
            }
          }
        )

      // Clean up when the client disconnects
      req.signal.addEventListener("abort", () => {
        unsubscribe()
        try {
          controller.close()
        } catch {
          // already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable Nginx buffering
    },
  })
}
