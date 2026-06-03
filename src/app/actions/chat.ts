"use server"

import { ChatService } from "@/lib/services/chat-service"
import { actionError, getActionUserId, type ActionResult } from "@/lib/actions/utils"
import type { Message, MessageAttachment } from "@/lib/types/database"

import { ProfileRepository } from "@/lib/repositories/profile-repository"

const chatService = new ChatService()
const profileRepository = new ProfileRepository()

export async function getChannelMessagesAction(
  channelId: string,
  cursor?: string
): Promise<ActionResult<{ items: Message[]; nextCursor: string | null }>> {
  try {
    const userId = await getActionUserId()
    const result = await chatService.getMessages(channelId, userId, 50, cursor)

    const senderIds = Array.from(new Set(result.items.map((m) => m.senderId)))
    const profiles = await profileRepository.getByIds(senderIds)
    const profileMap = new Map(profiles.map((p) => [p.id, p]))

    const enrichedItems = result.items.map((m) => ({
      ...m,
      senderProfile: profileMap.get(m.senderId),
    }))

    return { success: true, data: { items: enrichedItems, nextCursor: result.nextCursor } }
  } catch (e) {
    return actionError(e)
  }
}

export async function sendMessageAction(
  channelId: string,
  content: string,
  attachments?: Omit<MessageAttachment, "id" | "messageId" | "createdAt">[]
): Promise<ActionResult<Message>> {
  try {
    const userId = await getActionUserId()
    const message = await chatService.sendMessage(channelId, userId, content, { attachments })
    
    // Enrich with sender profile
    const profile = await profileRepository.getById(userId)
    const enrichedMessage = {
      ...message,
      senderProfile: profile ?? undefined,
    }
    
    return { success: true, data: enrichedMessage }
  } catch (e) {
    return actionError(e)
  }
}

export async function editMessageAction(
  messageId: string,
  content: string,
): Promise<ActionResult<Message>> {
  try {
    const userId = await getActionUserId()
    await chatService.editMessage(messageId, content, userId)
    
    // Fetch the updated message to return it
    const message = await chatService.getMessageById(messageId, userId)
    
    // Enrich with sender profile
    const profile = await profileRepository.getById(message.senderId)
    const enrichedMessage = {
      ...message,
      senderProfile: profile ?? undefined,
    }
    
    return { success: true, data: enrichedMessage }
  } catch (e) {
    return actionError(e)
  }
}

export async function deleteMessageAction(messageId: string): Promise<ActionResult> {
  try {
    const userId = await getActionUserId()
    await chatService.deleteMessage(messageId, userId)
    return { success: true, data: undefined }
  } catch (e) {
    return actionError(e)
  }
}
