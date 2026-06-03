"use server"

import { AIService } from "@/lib/services/ai-service"
import { actionError, getActionUserId, getActionOrgId, type ActionResult } from "@/lib/actions/utils"
import { BillingMiddleware } from "@/lib/middleware/billing-middleware"
import { makeBillingError } from "@/lib/billing/errors"
import type { AIConversation, AIMessage } from "@/lib/types/database"

const aiService = new AIService()

export async function getAIConversationsAction(classId: string): Promise<ActionResult<AIConversation[]>> {
  try {
    const userId = await getActionUserId()
    const conversations = await aiService.getConversations(classId, userId)
    return { success: true, data: conversations }
  } catch (e) {
    return actionError(e)
  }
}

export async function getAIConversationAction(
  conversationId: string
): Promise<ActionResult<{ conversation: AIConversation; messages: AIMessage[] } | null>> {
  try {
    const userId = await getActionUserId()
    const result = await aiService.getConversation(conversationId, userId)
    return { success: true, data: result }
  } catch (e) {
    return actionError(e)
  }
}

export async function startAIConversationAction(
  classId: string,
  title?: string
): Promise<ActionResult<AIConversation>> {
  try {
    const userId = await getActionUserId()
    const conversation = await aiService.startConversation(classId, userId, title)
    return { success: true, data: conversation }
  } catch (e) {
    return actionError(e)
  }
}

export async function sendAIMessageAction(
  conversationId: string,
  content: string
): Promise<ActionResult<{ userMessage: AIMessage; assistantMessage: AIMessage }>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Check AI feature access
    const { hasAccess, reason } = await BillingMiddleware.requireAIAccess(orgId)
    if (!hasAccess) {
      return { success: false, error: makeBillingError(reason || "AI feature not available") }
    }

    const result = await aiService.sendMessage(conversationId, content, userId)
    return { success: true, data: result }
  } catch (e) {
    return actionError(e)
  }
}

export async function sendAIMessageStreamAction(
  conversationId: string,
  content: string
): Promise<ActionResult<{ userMessage: AIMessage }>> {
  try {
    const userId = await getActionUserId()
    const orgId = await getActionOrgId()

    // Check AI feature access
    const { hasAccess, reason } = await BillingMiddleware.requireAIAccess(orgId)
    if (!hasAccess) {
      return { success: false, error: makeBillingError(reason || "AI feature not available") }
    }

    const userMessage = await aiService.createUserMessage(conversationId, content, userId)
    return { success: true, data: { userMessage } }
  } catch (e) {
    return actionError(e)
  }
}
