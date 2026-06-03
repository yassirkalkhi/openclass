import { BaseRepository } from "./base-repository"
import type {
  Message,
  MessageAttachment,
  MessageReaction,
} from "@/lib/types/database"
import { db } from "@/lib/firebase/firebase-admin"

export class MessageRepository extends BaseRepository<Message> {
  constructor() {
    super("messages")
  }

  async getByChannel(
    channelId: string,
    limit: number = 50,
    cursor?: string
  ): Promise<{ items: Message[]; nextCursor: string | null }> {
    return this.paginate(
      "channelId",
      "==",
      channelId,
      "createdAt",
      "desc",
      limit,
      cursor
    )
  }

  async getByReplyTo(messageId: string): Promise<Message[]> {
    return this.queryMany("replyToId", "==", messageId, "createdAt", "asc")
  }

  async getPinned(channelId: string): Promise<Message[]> {
    return this.queryManyMultiple(
      [
        { field: "channelId", operator: "==", value: channelId },
        { field: "pinned", operator: "==", value: true },
      ],
      "createdAt",
      "desc"
    )
  }

  async deleteByChannel(channelId: string): Promise<void> {
    const messages = await this.queryMany("channelId", "==", channelId)
    if (messages.length > 0) {
      await this.batchDelete(messages.map((m) => m.id))
    }
  }

  async countByChannel(channelId: string): Promise<number> {
    const snapshot = await this.collection
      .where("channelId", "==", channelId)
      .count()
      .get()
    return snapshot.data().count
  }
}

export class MessageAttachmentRepository extends BaseRepository<MessageAttachment> {
  constructor() {
    super("messageAttachments")
  }

  async getByMessage(messageId: string): Promise<MessageAttachment[]> {
    return this.queryMany("messageId", "==", messageId, "createdAt", "asc")
  }

  async deleteByMessage(messageId: string): Promise<void> {
    const attachments = await this.getByMessage(messageId)
    if (attachments.length > 0) {
      await this.batchDelete(attachments.map((a) => a.id))
    }
  }
}

export class MessageReactionRepository extends BaseRepository<MessageReaction> {
  constructor() {
    super("messageReactions")
  }

  async getByMessage(messageId: string): Promise<MessageReaction[]> {
    return this.queryMany("messageId", "==", messageId, "createdAt", "asc")
  }

  async getByMessageAndUser(
    messageId: string,
    userId: string
  ): Promise<MessageReaction[]> {
    return this.queryManyMultiple([
      { field: "messageId", operator: "==", value: messageId },
      { field: "userId", operator: "==", value: userId },
    ])
  }

  async getByMessageUserAndEmoji(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<MessageReaction | null> {
    const results = await this.queryManyMultiple([
      { field: "messageId", operator: "==", value: messageId },
      { field: "userId", operator: "==", value: userId },
      { field: "emoji", operator: "==", value: emoji },
    ])
    return results[0] ?? null
  }

  async deleteByMessage(messageId: string): Promise<void> {
    const reactions = await this.getByMessage(messageId)
    if (reactions.length > 0) {
      await this.batchDelete(reactions.map((r) => r.id))
    }
  }
}
