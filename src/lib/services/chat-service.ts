import {
  MessageRepository,
  MessageAttachmentRepository,
  MessageReactionRepository,
} from "@/lib/repositories/message-repository"
import { ChannelRepository } from "@/lib/repositories/channel-repository"
import { PermissionService } from "./permission-service"
import { NotificationService } from "./notification-service"
import { generateId } from "@/lib/utils"
import type {
  Message,
  MessageAttachment,
  MessageReaction,
} from "@/lib/types/database"

const messageRepository = new MessageRepository()
const attachmentRepository = new MessageAttachmentRepository()
const reactionRepository = new MessageReactionRepository()
const channelRepository = new ChannelRepository()
const permissionService = new PermissionService()
const notificationService = new NotificationService()

export class ChatService {
 
  async sendMessage(
    channelId: string,
    senderId: string,
    content: string,
    options?: {
      replyToId?: string
      attachments?: Omit<MessageAttachment, "id" | "messageId" | "createdAt">[]
    }
  ): Promise<Message> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requirePermission(channel.classId, senderId, "send_messages")

     if (channel.type === "announcement") {
      await permissionService.requireRole(channel.classId, senderId, "teacher")
    }

    const now = new Date().toISOString()
    const messageId = generateId()

    const message: Message = {
      id: messageId,
      channelId,
      senderId,
      content,
      replyToId: options?.replyToId,
      edited: false,
      pinned: false,
      attachments: [],
      reactions: [],
      createdAt: now,
    }
    await messageRepository.create(message)

     if (options?.attachments && options.attachments.length > 0) {
      const attachments: MessageAttachment[] = options.attachments.map((a) => ({
        ...a,
        id: generateId(),
        messageId,
        createdAt: now,
      }))
      await attachmentRepository.batchCreate(attachments)
       await messageRepository.update(messageId, { attachments })
    }

    if (channel.type === "announcement") {
      await notificationService.notifyClassStudents(
        channel.classId,
        {
          type: "announcement",
          title: `New announcement in #${channel.name}`,
          content: content.slice(0, 280),
        },
        senderId
      )
    }

    return message
  }

  
  async getMessageById(messageId: string, userId: string): Promise<Message> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return message
  }
 
  async editMessage(
    messageId: string,
    content: string,
    userId: string
  ): Promise<Message> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    if (message.senderId !== userId) {
      throw new Error("Forbidden: You can only edit your own messages")
    }

    const updatedAt = new Date().toISOString()
    await messageRepository.update(messageId, {
      content,
      edited: true,
      updatedAt,
    })

    return { ...message, content, edited: true, updatedAt }
  }

 
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    if (message.senderId !== userId) {
      // Only teachers/owners can delete others' messages
      await permissionService.requireRole(
        channel.classId,
        userId,
        "teacher"
      )
    }

    // Delete attachments and reactions
    await attachmentRepository.deleteByMessage(messageId)
    await reactionRepository.deleteByMessage(messageId)

    await messageRepository.delete(messageId)
  }

 
  async togglePin(messageId: string, userId: string): Promise<boolean> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireRole(
      channel.classId,
      userId,
      "teacher"
    )

    const newPinned = !(message.pinned ?? false)
    await messageRepository.update(messageId, { pinned: newPinned })
    return newPinned
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<MessageReaction> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    const existing = await reactionRepository.getByMessageUserAndEmoji(
      messageId,
      userId,
      emoji
    )
    if (existing) {
      throw new Error("You already reacted with this emoji")
    }

    const reaction: MessageReaction = {
      id: generateId(),
      messageId,
      userId,
      emoji,
      createdAt: new Date().toISOString(),
    }
    await reactionRepository.create(reaction)

    // Denormalize reactions onto the message document so the SSE stream
    // (which listens to `messages`) picks up the change automatically.
    const allReactions = await reactionRepository.getByMessage(messageId)
    await messageRepository.update(messageId, { reactions: allReactions })

    return reaction
  }

  async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    const existing = await reactionRepository.getByMessageUserAndEmoji(
      messageId,
      userId,
      emoji
    )
    if (!existing) throw new Error("Reaction not found")

    await reactionRepository.delete(existing.id)

    // Sync denormalized reactions on the message document
    const allReactions = await reactionRepository.getByMessage(messageId)
    await messageRepository.update(messageId, { reactions: allReactions })
  }

 
  async getMessages(
    channelId: string,
    userId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<{ items: Message[]; nextCursor: string | null }> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return messageRepository.getByChannel(channelId, limit, cursor)
  }

 
  async getPinnedMessages(
    channelId: string,
    userId: string
  ): Promise<Message[]> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return messageRepository.getPinned(channelId)
  }
 
  async getThread(messageId: string, userId: string): Promise<Message[]> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return messageRepository.getByReplyTo(messageId)
  }
}
