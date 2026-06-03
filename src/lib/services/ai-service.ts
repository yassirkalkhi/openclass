import {
  AIConversationRepository,
  AIMessageRepository,
  EmbeddingChunkRepository,
} from "@/lib/repositories/ai-repository"
import { ClassSettingsRepository } from "@/lib/repositories/class-settings-repository"
import { ResourceRepository } from "@/lib/repositories/resource-repository"
import { PermissionService } from "./permission-service"
import { generateId } from "@/lib/utils"
import type {
  AIConversation,
  AIMessage,
  AISource,
  EmbeddingChunk,
} from "@/lib/types/database"
import { type UpstashVectorMetadata, vectorIndex } from "@/lib/upstash/upstash"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const conversationRepository = new AIConversationRepository()
const messageRepository = new AIMessageRepository()
const embeddingChunkRepository = new EmbeddingChunkRepository()
const classSettingsRepository = new ClassSettingsRepository()
const resourceRepository = new ResourceRepository()
const permissionService = new PermissionService()

export class AIService {
  /**
   * Start a new AI conversation in a class.
   * Checks class settings for AI access.
   */
  async startConversation(
    classId: string,
    userId: string,
    title?: string
  ): Promise<AIConversation> {
    // Check AI access permission
    await permissionService.requirePermission(classId, userId, "use_ai")

    // Check class settings
    const settings = await classSettingsRepository.getByClass(classId)
    if (settings && !settings.allowAIAccess) {
      throw new Error("AI access is disabled for this class")
    }

    const conversation: AIConversation = {
      id: generateId(),
      classId,
      userId,
      title: title ?? "New Conversation",
      createdAt: new Date().toISOString(),
    }
    await conversationRepository.create(conversation)

    return conversation
  }

  /**
   * Create a user message (for streaming workflow)
   */
  async createUserMessage(
    conversationId: string,
    content: string,
    userId: string
  ): Promise<AIMessage> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    // Verify the user owns this conversation
    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only send messages in your own conversations")
    }

    // Check AI access permission
    await permissionService.requirePermission(conversation.classId, userId, "use_ai")

    const now = new Date().toISOString()

    // Store user message
    const userMessage: AIMessage = {
      id: generateId(),
      conversationId,
      role: "user",
      content,
      createdAt: now,
    }
    await messageRepository.create(userMessage)

    return userMessage
  }

  /**
   * Generate streaming response for AI
   */
  async *generateStreamingResponse(
    conversationId: string,
    userMessage: string,
    userId: string
  ): AsyncGenerator<{ type: "token" | "sources" | "done"; content?: string; sources?: AISource[] }> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only access your own conversations")
    }

    // Check AI access permission
    await permissionService.requirePermission(conversation.classId, userId, "use_ai")

    // Retrieve context from indexed resources (RAG)
    const context = await this.retrieveContext(conversation.classId, userMessage)

    // Build system context for the AI
    const conversationHistory = await messageRepository.getRecentByConversation(
      conversationId,
      10
    )

    // Compile fetched vector chunks into text context
    const contextText = context.chunks
      .map((chunk) => chunk.chunkText)
      .join("\n\n---\n\n")

    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }))

    try {
      const stream = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert academic assistant inside a virtual classroom platform. Use the verified source context fragments below to answer the user's questions accurately. If the context does not provide enough data to answer, rely gracefully on your internal knowledge base while mentioning that the course documents didn't explicitly address the topic.\n\n---\nCOURSE DOCUMENT CONTEXT MAP:\n${contextText || "No document context matching this query was found."}\n---`,
          },
          ...formattedHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_completion_tokens: 1024,
        stream: true,
      })

      let fullContent = ""

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          fullContent += content
          yield { type: "token", content }
        }
      }

      // Yield sources after streaming is complete
      if (context.sources.length > 0) {
        yield { type: "sources", sources: context.sources }
      }

      // Store the complete assistant message
      const assistantMessage: AIMessage = {
        id: generateId(),
        conversationId,
        role: "assistant",
        content: fullContent,
        sources: context.sources.length > 0 ? context.sources : [],
        createdAt: new Date().toISOString(),
      }
      await messageRepository.create(assistantMessage)

      yield { type: "done" }
    } catch (error) {
      console.error("Groq Streaming API Error: ", error)
      throw new Error("Failed to generate a streaming response from the AI coordinator.")
    }
  }

  /**
   * Send a message in an AI conversation.
   * Retrieves relevant context from embedding chunks (RAG),
   * then stores the user message and AI response.
   *
   * NOTE: The actual AI response generation (LLM call) is left
   * as a placeholder. Integrate your preferred AI provider here.
   */
  async sendMessage(
    conversationId: string,
    content: string,
    userId: string
  ): Promise<{ userMessage: AIMessage; assistantMessage: AIMessage }> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    // Verify the user owns this conversation
    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only send messages in your own conversations")
    }

    // Check AI access permission
    await permissionService.requirePermission(conversation.classId, userId, "use_ai")

    const now = new Date().toISOString()

    // Store user message
    const userMessage: AIMessage = {
      id: generateId(),
      conversationId,
      role: "user",
      content,
      createdAt: now,
    }
    await messageRepository.create(userMessage)

    // Retrieve context from indexed resources (RAG)
    const context = await this.retrieveContext(conversation.classId, content)

    // Build system context for the AI
    const conversationHistory = await messageRepository.getRecentByConversation(
      conversationId,
      10
    )

    // Generate AI response
    // TODO: Integrate actual LLM provider (OpenAI, Anthropic, etc.)
    const aiResponseContent = await this.generateResponse(
      content,
      context.chunks,
      conversationHistory
    )

    // Build sources from matched resources
    const sources: AISource[] = context.sources

    // Store assistant message
    const assistantMessage: AIMessage = {
      id: generateId(),
      conversationId,
      role: "assistant",
      content: aiResponseContent,
      sources: sources.length > 0 ? sources : [],
      createdAt: new Date().toISOString(),
    }
    await messageRepository.create(assistantMessage)

    return { userMessage, assistantMessage }
  }

  /**
   * Retrieve relevant embedding chunks for RAG context.
   */
  private async retrieveContext(
    classId: string,
    query: string
  ): Promise<{ chunks: EmbeddingChunk[]; sources: AISource[] }> {
    // 1. Run similarity query inside the class's isolated namespace
    // We pass 'data' instead of 'vector' to use Upstash's native embedding generation
    const vectorMatches = await vectorIndex.query<UpstashVectorMetadata>(
      {
        data: query,
        topK: 5, // Return top 5 matching blocks
        includeMetadata: true,
      },
      { namespace: `class-${classId}` }
    )

    if (!vectorMatches || vectorMatches.length === 0) {
      return { chunks: [], sources: [] }
    }

    // 2. Map Upstash vectors directly to your local entity format
    const chunks: EmbeddingChunk[] = vectorMatches.map((match) => ({
      id: match.id.toString(),
      mediaId: match.metadata?.mediaId ?? "",
      chunkText: match.metadata?.chunkText ?? "",
      embeddingId: match.id.toString(),
      createdAt: new Date().toISOString(),
    }))

    // 3. Extract uniquely matched media tracking IDs to associate citation records
    const matchedMediaIds = Array.from(new Set(chunks.map((c) => c.mediaId)))
    const sources: AISource[] = []

    if (matchedMediaIds.length > 0) {
      const resources = await resourceRepository.getAIIndexed(classId)
      const filteredResources = resources.filter((r) => matchedMediaIds.includes(r.id))

      filteredResources.forEach((r) => {
        sources.push({
          id: r.id,
          title: r.title,
          type: r.fileType,
          url: r.fileUrl,
        })
      })
    }

    return { chunks, sources }
  }

  /**
   * Generate an AI response.
   * Placeholder — integrate your LLM provider here.
   */
  private async generateResponse(
    userMessage: string,
    contextChunks: EmbeddingChunk[],
    conversationHistory: AIMessage[]
  ): Promise<string> {
    // Compile fetched vector chunks into text context
    const contextText = contextChunks
      .map((chunk) => chunk.chunkText)
      .join("\n\n---\n\n")


    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }))

    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert academic assistant inside a virtual classroom platform. Use the verified source context fragments below to answer the user's questions accurately. If the context does not provide enough data to answer, rely gracefully on your internal knowledge base while mentioning that the course documents didn't explicitly address the topic.\n\n---\nCOURSE DOCUMENT CONTEXT MAP:\n${contextText || "No document context matching this query was found."}\n---`,
          },
          ...formattedHistory,
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_completion_tokens: 1024,
      })

      return response.choices[0]?.message?.content ?? "No response generated."
    } catch (error) {
      console.error("Groq Completion API Error: ", error)
      throw new Error("Failed to generate a completion response from the AI coordinator.")
    }
  }
  /**
   * Get all conversations for a user in a class.
   */
  async getConversations(
    classId: string,
    userId: string
  ): Promise<AIConversation[]> {
    // await permissionService.requireMembership(classId, userId)
    return conversationRepository.getByUser(classId, userId)
  }

  /**
   * Get a full conversation with all messages.
   */
  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<{ conversation: AIConversation; messages: AIMessage[] } | null> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) return null

    // Only the conversation owner can view it
    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only view your own conversations")
    }

    const messages = await messageRepository.getByConversation(conversationId)
    return { conversation, messages }
  }

  /**
   * Update a conversation title.
   */
  async updateConversationTitle(
    conversationId: string,
    title: string,
    userId: string
  ): Promise<void> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only update your own conversations")
    }

    await conversationRepository.update(conversationId, { title })
  }

  /**
   * Delete a conversation and all its messages.
   */
  async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversation = await conversationRepository.getById(conversationId)
    if (!conversation) throw new Error("Conversation not found")

    if (conversation.userId !== userId) {
      throw new Error("Forbidden: You can only delete your own conversations")
    }

    await messageRepository.deleteByConversation(conversationId)
    await conversationRepository.delete(conversationId)
  }

  // ===== Embedding Chunk Management (for pipeline use) =====

  /**
   * Store embedding chunks for a resource (called by the indexing pipeline).
   */
  async storeEmbeddingChunks(
    classId: string,
    mediaId: string,
    chunks: Array<{ chunkText: string; embeddingId: string; metadata?: Record<string, unknown> }>
  ): Promise<void> {
    const now = new Date().toISOString()
    const embeddingChunks: EmbeddingChunk[] = chunks.map((chunk) => ({
      id: generateId(),
      mediaId,
      chunkText: chunk.chunkText,
      embeddingId: chunk.embeddingId,
      metadata: chunk.metadata,
      createdAt: now,
    }))
    await embeddingChunkRepository.batchCreate(embeddingChunks)

    const upstashPayload = chunks.map((chunk, index) => ({
      id: embeddingChunks[index].id, // Maintain an identical shared ID
      data: chunk.chunkText,         // Upstash will natively generate the vector array for this string
      metadata: {
        mediaId,
        chunkText: chunk.chunkText,
      },
    }))

    // 4. Upload directly to Upstash inside the class namespace boundary
    await vectorIndex.upsert(upstashPayload, { namespace: `class-${classId}` })
  }

  /**
   * Delete all embedding chunks for a resource.
   */
  async deleteEmbeddingChunks(classId: string, mediaId: string): Promise<void> {
    const localChunks = await embeddingChunkRepository.getByMediaIds([mediaId])

    if (localChunks.length > 0) {
      const chunkIds = localChunks.map((c) => c.id)

      await vectorIndex.delete(chunkIds, { namespace: `class-${classId}` })
    }

    await embeddingChunkRepository.deleteByMedia(mediaId)
  }
}