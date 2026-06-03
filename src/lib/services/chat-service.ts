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
  /**
   * Send a message to a channel.
   */
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

    // Announcement channels: only teachers/owners can send
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

    // Create attachments if provided
    if (options?.attachments && options.attachments.length > 0) {
      const attachments: MessageAttachment[] = options.attachments.map((a) => ({
        ...a,
        id: generateId(),
        messageId,
        createdAt: now,
      }))
      await attachmentRepository.batchCreate(attachments)
      // Update message with attachment references
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

  /**
   * Get a single message by ID (caller must be a member of the channel's class).
   */
  async getMessageById(messageId: string, userId: string): Promise<Message> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return message
  }

  /**
   * Edit a message. Only the original sender can edit.
   */
  async editMessage(
    messageId: string,
    content: string,
    userId: string
  ): Promise<void> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    if (message.senderId !== userId) {
      throw new Error("Forbidden: You can only edit your own messages")
    }

    await messageRepository.update(messageId, {
      content,
      edited: true,
      updatedAt: new Date().toISOString(),
    })
  }

  /**
   * Delete a message. Sender or teachers/owners can delete.
   */
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

  /**
   * Pin/unpin a message. Requires teacher role.
   */
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

    const newPinned = !message.pinned
    await messageRepository.update(messageId, { pinned: newPinned })
    return newPinned
  }

  /**
   * Add a reaction to a message.
   */
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

    // Check if user already reacted with this emoji
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

    return reaction
  }

  /**
   * Remove a reaction.
   */
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
  }

  /**
   * Get messages for a channel (paginated, newest-first).
   */
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

  /**
   * Get pinned messages for a channel.
   */
  async getPinnedMessages(
    channelId: string,
    userId: string
  ): Promise<Message[]> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return messageRepository.getPinned(channelId)
  }

  /**
   * Get thread replies for a message.
   */
  async getThread(messageId: string, userId: string): Promise<Message[]> {
    const message = await messageRepository.getById(messageId)
    if (!message) throw new Error("Message not found")

    const channel = await channelRepository.getById(message.channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireMembership(channel.classId, userId)

    return messageRepository.getByReplyTo(messageId)
  }
}
