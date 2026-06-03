"use server"

import { AIService } from "@/lib/services/ai-service"

const aiService = new AIService()
const SYSTEM_TEST_MEDIA_ID = "functional-test-media-id"

/**
 * STEP 1: Initialize a real conversation record in your database stores
 */
export async function createFunctionalConversationAction(classId: string, userId: string) {
  if (!classId || !userId) throw new Error("Class ID and User ID profiles must be specified.")
  
  const testTitle = `Functional Suite [${new Date().toLocaleTimeString()}]`
  
  // Triggers your actual database collection document provisioning
  const conversation = await aiService.startConversation(classId, userId, testTitle)
  
  return JSON.parse(JSON.stringify(conversation))
}

/**
 * STEP 2: Index mock raw textual components into your Upstash Vector Namespace
 */
export async function seedFunctionalVectorAction(classId: string, title: string, content: string) {
  if (!classId || !content.trim()) throw new Error("Target namespace constraints and context payload are missing.")
  
  // Functional split behavior to create vector array payload structures
  const chunks = content
    .split("\n\n")
    .filter(p => p.trim().length > 0)
    .map((paragraph, index) => ({
      chunkText: paragraph.trim(),
      embeddingId: `func-chunk-${Date.now()}-${index}`,
      metadata: { source: title, classId, processedAt: new Date().toISOString() }
    }))

  // Reaches out to your production Upstash backend embedding wrapper method
  await aiService.storeEmbeddingChunks(classId, SYSTEM_TEST_MEDIA_ID, chunks)
  
  return {
    success: true,
    chunkCount: chunks.length,
    timestamp: new Date().toLocaleTimeString()
  }
}

/**
 * STEP 3: Dispatch live user queries into your real RAG + LLM execution system
 */
export async function sendFunctionalMessageAction(conversationId: string, content: string, userId: string) {
  if (!conversationId || !content.trim() || !userId) throw new Error("Missing structural execution tokens.")
  
  // Calling your standard production messaging routine
  const result = await aiService.sendMessage(conversationId, content, userId)
  
  return JSON.parse(JSON.stringify(result))
}