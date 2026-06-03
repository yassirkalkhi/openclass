"use client"

import { useSearchParams } from "next/navigation"
import { AIAssistantView } from "@/components/workspace/ai-assistant-view"

export function AIAssistantChannelPage() {
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("c")

  return <AIAssistantView activeConversationId={conversationId} />
}
