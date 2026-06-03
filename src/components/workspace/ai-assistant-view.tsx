"use client"

import { useEffect, useRef, useState } from "react"
import {
  getAIConversationAction,
  startAIConversationAction,
  sendAIMessageStreamAction,
} from "@/app/actions/ai"
import { checkAIAccessAction } from "@/app/actions/billing"
import { useClass } from "@/context/class-context"
import { useAuth } from "@/context/auth-context"
import type { AIMessage, AISource } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, FileText, Lock, SendIcon, Sparkle, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"

type AIAssistantViewProps = {
  activeConversationId?: string | null
  onConversationChange?: (id: string | null) => void
}

export function AIAssistantView({ activeConversationId, onConversationChange }: AIAssistantViewProps) {
  const { classData, settings, permissions } = useClass()
  const currentUser = useAuth()?.user
  const { t } = useI18n()

  const userCanUseAI = permissions.find((p) => p.key === "use_ai")?.enabled !== false

  const [internalId, setInternalId] = useState<string | null>(activeConversationId ?? null)
  const activeId = activeConversationId !== undefined ? activeConversationId : internalId
  const setActiveId = (id: string | null) => {
    if (onConversationChange) onConversationChange(id)
    else setInternalId(id)
  }

  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [streamingSources, setStreamingSources] = useState<AISource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiAccess, setAiAccess] = useState<{ hasAccess: boolean; reason?: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const conversationIdRef = useRef(activeId)
  const scrollContainerRef = useRef<HTMLElement | null>(null)

  const aiEnabled = settings?.allowAIAccess !== false

  // Check real AI access (subscription + feature flag) on mount
  useEffect(() => {
    checkAIAccessAction().then((result) => {
      if (result.success && result.data) {
        setAiAccess(result.data)
      } else {
        setAiAccess({ hasAccess: false })
      }
    })
  }, [])

  function loadConversation(id: string) {
    setIsLoading(true)
    getAIConversationAction(id).then((r) => {
      if (r.success && r.data && conversationIdRef.current === id) setMessages(r.data.messages)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }

  useEffect(() => {
    conversationIdRef.current = activeId
    setMessages([])
    if (activeId) loadConversation(activeId)
    else setIsLoading(false)
  }, [activeId])

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (el) scrollContainerRef.current = el as HTMLElement
    }
  }, [])

  useEffect(() => {
    if (scrollContainerRef.current)
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
  }, [messages, streamingContent])

  function startNewChat() {
    startAIConversationAction(classData.id).then((result) => {
      if (result.success && result.data) { setActiveId(result.data.id); setMessages([]) }
    })
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || !activeId || isStreaming) return

    const content = input.trim()
    setInput("")

    const tempUserId = `temp-user-${Date.now()}`
    const userMessage: AIMessage = {
      id: tempUserId,
      conversationId: activeId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    const result = await sendAIMessageStreamAction(activeId, content)
    if (!result.success || !result.data) {
      setMessages((prev) => prev.filter((m) => m.id !== tempUserId))
      setInput(content)
      return
    }
    setMessages((prev) => prev.map((m) => (m.id === tempUserId ? result.data!.userMessage : m)))

    setIsStreaming(true)
    setStreamingContent("")
    setStreamingSources([])

    try {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, content }),
      })
      if (!response.ok) throw new Error("Stream failed")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let fullContent = ""
      let sources: AISource[] = []

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            if (data.type === "token" && data.content) {
              fullContent += data.content
              setStreamingContent((prev) => prev + data.content)
            } else if (data.type === "sources" && data.sources) {
              sources = data.sources
              setStreamingSources(data.sources)
            } else if (data.type === "done") {
              const assistantMessage: AIMessage = {
                id: `ai-${Date.now()}`,
                conversationId: activeId,
                role: "assistant",
                content: fullContent,
                sources: sources.length > 0 ? sources : undefined,
                createdAt: new Date().toISOString(),
              }
              setMessages((prev) => [...prev, assistantMessage])
              setStreamingContent("")
              setStreamingSources([])
              setIsStreaming(false)
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
      setIsStreaming(false)
      setStreamingContent("")
      setStreamingSources([])
      loadConversation(activeId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // Paywall — rendered after all hooks
  if (aiAccess !== null && !aiAccess.hasAccess) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
        <ChannelHeader title={t.ai.title} desc={t.ai.channelDesc} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-sm">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm mx-auto">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold tracking-tight mb-2">{t.ai.premiumFeature}</h2>
            <p className="text-sm text-muted-foreground mb-5">{t.ai.premiumDesc}</p>
            <Button asChild size="sm">
              <Link href="/app/billing">{t.ai.upgradePlan}</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!aiEnabled) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
        <ChannelHeader title={t.ai.title} desc={t.ai.channelDesc} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm mx-auto">
              <Sparkle className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-medium tracking-tight mb-2">{t.ai.disabled}</h2>
            <p className="text-sm text-muted-foreground">{t.ai.disabledDesc}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userCanUseAI) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
        <ChannelHeader title={t.ai.title} desc={t.ai.channelDesc} />
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm mx-auto">
              <Lock className="size-6 text-muted-foreground" />
            </div>
            <h2 className="text-base font-medium tracking-tight mb-2">AI Assistant Unavailable</h2>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have permission to use the AI assistant in this class.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      <ChannelHeader title={t.ai.title} desc={t.ai.channelDesc} />

      <ScrollArea ref={scrollRef} className="flex-1 px-27 bg-gradient-to-b from-background to-muted/5">
        <div className="flex min-h-full w-full flex-col justify-end px-4 py-6 md:px-6">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-4 p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-4 w-2/3 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : !activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h2 className="text-base font-medium tracking-tight">{t.ai.startConversation}</h2>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground mb-4">{t.ai.startConversationDesc}</p>
            
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
                <Sparkle className="size-6 text-primary" />
              </div>
              <h2 className="text-base font-medium tracking-tight">{t.ai.welcome}</h2>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">{t.ai.welcomeDesc}</p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === "user"
                const displayName = isUser ? (currentUser?.fullName || "You") : t.ai.title
                const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                const previousMessage = messages[index - 1]
                const isGrouped = previousMessage && previousMessage.role === msg.role

                return (
                  <div
                    key={msg.id}
                    className={["group relative flex gap-3 px-3 py-1.5 transition-all hover:bg-muted/30 rounded-xl select-text cursor-default", !isGrouped ? "mt-4" : "mt-0.5"].join(" ")}
                  >
                    <div className="w-9 shrink-0 select-none">
                      {!isGrouped ? (
                        <Avatar className="size-9 rounded-xl shadow-sm">
                          {isUser ? (
                            <>
                              <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.fullName} />
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary rounded-xl">{initials}</AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                              <Sparkle className="size-5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      ) : (
                        <div className="hidden h-full items-center justify-center text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground/60 md:flex">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {!isGrouped && (
                        <div className="mb-1 flex items-baseline gap-2">
                          <span className="text-sm font-semibold tracking-tight text-foreground/90">{displayName}</span>
                          <span className="text-[10px] tracking-wide text-muted-foreground/80">
                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                      <div className="pl-0.5 text-sm leading-relaxed text-foreground/90 font-normal">
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2.5">
                          {msg.sources.map((src) => (
                            <a key={src.id} href={src.url || "#"} target="_blank" rel="noopener noreferrer"
                              className="flex max-w-sm items-center gap-2.5 rounded-xl border bg-card px-3 py-2 shadow-sm transition-all hover:bg-accent/40">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <FileText className="size-4 text-muted-foreground" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-foreground">{src.title}</p>
                                <p className="text-[10px] text-muted-foreground">{src.type || t.ai.resource}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {isStreaming && streamingContent && (
                <div className="group relative flex gap-3 px-3 py-1.5 transition-all rounded-xl mt-4">
                  <div className="w-9 shrink-0 select-none">
                    <Avatar className="size-9 rounded-xl shadow-sm">
                      <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Sparkle className="size-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="text-sm font-semibold tracking-tight text-foreground/90">{t.ai.title}</span>
                      <span className="text-[10px] tracking-wide text-muted-foreground/80">{t.ai.now}</span>
                    </div>
                    <div className="pl-0.5 text-sm leading-relaxed text-foreground/90 font-normal">
                      <p className="whitespace-pre-wrap break-words">
                        {streamingContent}
                        <span className="inline-block w-1 h-4 bg-primary ml-0.5 animate-pulse" />
                      </p>
                    </div>
                    {streamingSources.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-2.5">
                        {streamingSources.map((src) => (
                          <a key={src.id} href={src.url || "#"} target="_blank" rel="noopener noreferrer"
                            className="flex max-w-sm items-center gap-2.5 rounded-xl border bg-card px-3 py-2 shadow-sm transition-all hover:bg-accent/40">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <FileText className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-foreground">{src.title}</p>
                              <p className="text-[10px] text-muted-foreground">{src.type || t.ai.resource}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <div className="sticky bottom-0 shrink-0 bg-background/80 p-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl">
          <form onSubmit={handleSend} className="overflow-hidden rounded-2xl border bg-card shadow-lg backdrop-blur">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeId ? t.ai.messagePlaceholder : t.ai.startConversationFirst}
              disabled={!activeId || isStreaming}
              rows={1}
              className="min-h-[52px] resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex items-center justify-end gap-2 bg-muted/5 px-4 py-2.5">
             
              <Button
                type="submit" size="icon"
                disabled={!activeId || isStreaming || !input.trim()}
                className="gap-3 w-25 h-10 rounded-2xl shadow-sm"
              >
                <SendIcon className="size-3.5" />
                {t.chat.send}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ChannelHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Sparkle className="size-5 text-primary" />
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
