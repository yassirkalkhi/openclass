import { NextRequest } from "next/server"
import { AIService } from "@/lib/services/ai-service"
import { getActionUserId, getActionOrgId } from "@/lib/actions/utils"
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"

const aiService = new AIService()

export async function POST(request: NextRequest) {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Guard: AI feature must be enabled
    const { hasAccess, reason } = await BillingMiddleware.requireAIAccess(orgId)
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "billing_locked", reason }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      )
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return new Response("Missing required fields", { status: 400 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiService.generateStreamingResponse(
            conversationId,
            content,
            userId
          )) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(encoder.encode(data))
          }
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Stream route error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
