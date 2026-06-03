"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Plus, Sparkle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useClass } from "@/context/class-context"
import { Button } from "@/components/ui/button"
import {
  getAIConversationsAction,
  startAIConversationAction,
} from "@/app/actions/ai"
import type { AIConversation } from "@/lib/types/database"
import {
  AI_ASSISTANT_CHANNEL_SLUG,
  aiAssistantChannelHref,
} from "@/lib/workspace/ai-channel"
import { useTranslation } from "@/lib/i18n/context"

export function AIChannelSidebarItem({ classSlug }: { classSlug: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { classData, settings, permissions } = useClass()
  const { t } = useTranslation("channels")
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [pending, startTransition] = useTransition()

  const href = aiAssistantChannelHref(classSlug)
  const isActive = pathname.includes(`/channels/${AI_ASSISTANT_CHANNEL_SLUG}`)
  const activeConversationId = searchParams.get("c")
  const aiEnabled = settings?.allowAIAccess !== false
  const userCanUseAI = permissions.find((p) => p.key === "use_ai")?.enabled !== false

  function loadConversations() {
    getAIConversationsAction(classData.id).then((r) => {
      if (r.success && r.data) setConversations(r.data)
    })
  }

  useEffect(() => {
    if (aiEnabled && userCanUseAI) loadConversations()
  }, [classData.id, aiEnabled, userCanUseAI])

  useEffect(() => {
    if (isActive) loadConversations()
  }, [isActive, pathname])

  if (!aiEnabled || !userCanUseAI) {
    return null
  }

  function handleNewChat() {
    startTransition(async () => {
      const result = await startAIConversationAction(classData.id)
      if (result.success && result.data) {
        loadConversations()
        router.push(`${href}?c=${result.data.id}`)
      }
    })
  }

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Sparkle className="size-4 shrink-0" />
        <span className="truncate">{t.aiAssistant}</span>
      </Link>

      {isActive && (
        <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-border/60 pl-2">
          <li>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-start gap-1.5 px-2 text-xs text-muted-foreground"
              disabled={pending}
              onClick={handleNewChat}
            >
              <Plus className="size-3.5" />
              {t.newConversation}
            </Button>
          </li>
          {conversations.map((c) => {
            const threadHref = `${href}?c=${c.id}`
            const threadActive = activeConversationId === c.id
            return (
              <li key={c.id}>
                <Link
                  href={threadHref}
                  className={cn(
                    "block rounded-md px-2 py-1 text-xs truncate",
                    threadActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {c.title ?? t.conversation}
                </Link>
              </li>
            )
          })}
          {conversations.length === 0 && (
            <li className="px-2 py-1 text-[10px] text-muted-foreground">{t.noConversationsYet}</li>
          )}
        </ul>
      )}
    </li>
  )
}
