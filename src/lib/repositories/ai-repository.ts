import { BaseRepository } from "./base-repository"
import type {
  AIConversation,
  AIMessage,
  EmbeddingChunk,
} from "@/lib/types/database"

export class AIConversationRepository extends BaseRepository<AIConversation> {
  constructor() {
    super("aiConversations")
  }

  async getByUser(classId: string, userId: string): Promise<AIConversation[]> {
    return this.queryManyMultiple(
      [
        { field: "classId", operator: "==", value: classId },
        { field: "userId", operator: "==", value: userId },
      ],
      "createdAt",
      "desc"
    )
  }

  async getByClass(classId: string): Promise<AIConversation[]> {
    return this.queryMany("classId", "==", classId, "createdAt", "desc")
  }

  async deleteByClass(classId: string): Promise<void> {
    const conversations = await this.getByClass(classId)
    if (conversations.length > 0) {
      await this.batchDelete(conversations.map((c) => c.id))
    }
  }
}

export class AIMessageRepository extends BaseRepository<AIMessage> {
  constructor() {
    super("aiMessages")
  }

  async getByConversation(conversationId: string): Promise<AIMessage[]> {
    return this.queryMany("conversationId", "==", conversationId, "createdAt", "asc")
  }

  async getRecentByConversation(
    conversationId: string,
    limit: number = 20
  ): Promise<AIMessage[]> {
    return this.queryManyMultiple(
      [{ field: "conversationId", operator: "==", value: conversationId }],
      "createdAt",
      "desc",
      limit
    )
  }

  async deleteByConversation(conversationId: string): Promise<void> {
    const messages = await this.getByConversation(conversationId)
    if (messages.length > 0) {
      await this.batchDelete(messages.map((m) => m.id))
    }
  }
}

export class EmbeddingChunkRepository extends BaseRepository<EmbeddingChunk> {
  constructor() {
    super("embeddingChunks")
  }

  async getByMedia(mediaId: string): Promise<EmbeddingChunk[]> {
    return this.queryMany("mediaId", "==", mediaId, "createdAt", "asc")
  }

  async getByEmbeddingId(embeddingId: string): Promise<EmbeddingChunk | null> {
    return this.queryOne("embeddingId", "==", embeddingId)
  }

  async deleteByMedia(mediaId: string): Promise<void> {
    const chunks = await this.getByMedia(mediaId)
    if (chunks.length > 0) {
      await this.batchDelete(chunks.map((c) => c.id))
    }
  }

  async getByMediaIds(mediaIds: string[]): Promise<EmbeddingChunk[]> {
    if (mediaIds.length === 0) return []
    const chunks: string[][] = []
    for (let i = 0; i < mediaIds.length; i += 30) {
      chunks.push(mediaIds.slice(i, i + 30))
    }
    const results: EmbeddingChunk[] = []
    for (const chunk of chunks) {
      const snapshot = await this.collection
        .where("mediaId", "in", chunk)
        .get()
      results.push(...snapshot.docs.map((doc) => doc.data() as EmbeddingChunk))
    }
    return results
  }
}
