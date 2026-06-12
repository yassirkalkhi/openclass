"use client"

import { useEffect, useState, useTransition, useRef } from "react"
import { FileText, X, Pencil, Trash2, Check, SendIcon, Wifi, WifiOff } from "lucide-react"
import {
  sendMessageAction,
  deleteMessageAction,
  editMessageAction,
  addReactionAction,
  removeReactionAction,
} from "@/app/actions/chat"
import { ALLOWED_REACTION_EMOJIS } from "@/lib/chat/reactions"
import { usePermission } from "@/hooks/use-permission"
import { useClass } from "@/context/class-context"
import type { Message, Channel, MessageAttachment } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileUpload } from "@/components/upload/file-upload"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { useAuth } from "@/context/auth-context"
import { useI18n } from "@/lib/i18n/context"
import { useRealtimeMessages } from "@/hooks/use-realtime-messages"

type PendingAttachment = Omit<MessageAttachment, "id" | "messageId" | "createdAt">

export function ChatView({ channel }: { channel: Channel }) {
  const { classData } = useClass()
  const { t } = useI18n()

   const { messages: realtimeMessages, isLoading, isConnected } = useRealtimeMessages(channel.id)

   const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [pending, startTransition] = useTransition()
  const [isSending, setIsSending] = useState(false)

  const canSend = usePermission("send_messages")
  const canUpload = usePermission("upload_files")

  const auth = useAuth()
  const currentUserId = auth?.user?.id
  const scrollRef = useRef<HTMLDivElement>(null)

   
  const messages = [
    ...realtimeMessages,
    ...optimisticMessages.filter(
      (opt) => !realtimeMessages.some((rt) => rt.id === opt.id)
    ),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

   useEffect(() => {
    setOptimisticMessages([])
  }, [channel.id])

   const prevMessageCountRef = useRef(0)
  useEffect(() => {
    const count = messages.length
    if (count !== prevMessageCountRef.current) {
      prevMessageCountRef.current = count
      if (scrollRef.current) {
        const el = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (el) el.scrollTop = el.scrollHeight
      }
    }
  }, [messages])

  const canSubmit = canSend && !isSending && (content.trim().length > 0 || pendingAttachments.length > 0)

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    if (!canSubmit || pending || isSending) return

    const messageContent = content.trim() || "(attachment)"
    const attachments = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    setContent("")
    setPendingAttachments([])
    setIsSending(true)

 
    const optimisticMessage: any = {
      id: `temp-${Date.now()}`,
      channelId: channel.id,
      senderId: currentUserId!,
      content: messageContent,
      attachments: attachments as any,
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      senderProfile: {
        id: currentUserId!,
        fullName: auth?.user?.fullName || "You",
        email: auth?.user?.email || "",
        avatarUrl: auth?.user?.avatarUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    setOptimisticMessages((prev) => [...prev, optimisticMessage])

    startTransition(async () => {
      const result = await sendMessageAction(channel.id, messageContent, attachments)
      setIsSending(false)
 
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
      if (!result.success) {
         setContent(messageContent === "(attachment)" ? "" : messageContent)
        if (attachments) setPendingAttachments(attachments as any)
      }
    })
  }

  async function handleEdit(messageId: string) {
    if (!editContent.trim() || pending) return
    startTransition(async () => {
      const result = await editMessageAction(messageId, editContent.trim())
      if (result.success) {
        setEditingMessageId(null)
        setEditContent("")
        // The SSE stream will deliver the updated message automatically
      }
    })
  }

  async function handleDelete(messageId: string) {
    startTransition(async () => {
       setOptimisticMessages((prev) => prev.filter((m) => m.id !== messageId))
      await deleteMessageAction(messageId)
     })
  }

  async function handleReaction(messageId: string, emoji: string) {
    const currentUserId_ = currentUserId
    if (!currentUserId_) return

     const msg = messages.find((m) => m.id === messageId)
    const alreadyReacted = msg?.reactions?.some(
      (r) => r.emoji === emoji && r.userId === currentUserId_
    )

     setOptimisticMessages((prev) => {
      const existingIdx = prev.findIndex((m) => m.id === messageId)
      const base = existingIdx !== -1 ? prev[existingIdx] : msg
      if (!base) return prev

      const updatedReactions = alreadyReacted
        ? (base.reactions ?? []).filter(
            (r) => !(r.emoji === emoji && r.userId === currentUserId_)
          )
        : [
            ...(base.reactions ?? []),
            {
              id: `opt-${Date.now()}`,
              messageId,
              userId: currentUserId_,
              emoji,
              createdAt: new Date().toISOString(),
            },
          ]

      const updated = { ...base, reactions: updatedReactions }
      if (existingIdx !== -1) {
        const next = [...prev]
        next[existingIdx] = updated
        return next
      }
      return [...prev, updated]
    })

    startTransition(async () => {
      if (alreadyReacted) {
        await removeReactionAction(messageId, emoji)
      } else {
        await addReactionAction(messageId, emoji)
      }
      
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, messageId: string) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(messageId) }
    else if (e.key === "Escape") { setEditingMessageId(null); setEditContent("") }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-semibold">#</span>
            <h1 className="truncate text-lg font-semibold tracking-tight">{channel.name}</h1>
          </div>
          {channel.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{channel.description}</p>
          )}
        </div>
        {/* Real-time connection indicator */}
        <div className="ml-4 flex shrink-0 items-center gap-1.5">
          {isConnected ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-500/80">
              <Wifi className="size-3" />
              <span className="hidden sm:inline">Live</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <WifiOff className="size-3" />
              <span className="hidden sm:inline">Reconnecting…</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 px-2 bg-gradient-to-b from-background to-muted/5">
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
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
                <span className="text-xl text-muted-foreground">#</span>
              </div>
              <h2 className="text-base font-medium tracking-tight">
                {t.chat.welcomeTo.replace("{{channel}}", channel.name)}
              </h2>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {t.chat.startConversation}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const displayName = msg.senderProfile?.fullName ?? msg.senderId.slice(0, 8)
              const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
              const previousMessage = messages[index - 1]
              const isGrouped = previousMessage && previousMessage.senderId === msg.senderId
              const isOwnMessage = msg.senderId === currentUserId
              const isEditing = editingMessageId === msg.id

              return (
                <ContextMenu key={msg.id}>
                  <ContextMenuTrigger asChild>
                    <div className={["group relative flex gap-3 px-3 py-1.5 transition-all hover:bg-muted/30 rounded-xl select-text cursor-default", !isGrouped ? "mt-4" : "mt-0.5"].join(" ")}>
                      <div className="w-9 shrink-0 select-none">
                        {!isGrouped ? (
                          <Avatar className="size-9 rounded-xl shadow-sm">
                            <AvatarImage src={msg.senderProfile?.avatarUrl} alt={msg.senderProfile?.fullName} />
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary rounded-xl">{initials}</AvatarFallback>
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

                        {isEditing ? (
                          <div className="mt-1 w-full max-w-2xl rounded-2xl border border-input bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(e, msg.id)}
                              className="min-h-[44px] w-full resize-none border-0 bg-transparent px-2 py-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                              rows={2}
                              autoFocus
                              disabled={pending}
                            />
                            <div className="mt-2 flex items-center justify-between border-t pt-2 px-1 text-xs">
                              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                {t.chat.escapeToCancel}{" "}
                                <span className="underline">{t.chat.cancelAction}</span>
                                {" · "}
                                {t.chat.enterToSave}{" "}
                                <span className="underline">{t.chat.saveAction}</span>
                              </span>
                              <div className="flex items-center gap-1.5 ml-auto">
                                <Button
                                  size="sm" variant="ghost"
                                  className="h-7 px-2.5 text-xs rounded-lg"
                                  disabled={pending}
                                  onClick={() => { setEditingMessageId(null); setEditContent("") }}
                                >
                                  {t.chat.cancel}
                                </Button>
                                <Button
                                  size="sm" variant="default"
                                  className="h-7 px-3 text-xs gap-1 rounded-lg font-medium shadow-sm"
                                  disabled={pending || !editContent.trim()}
                                  onClick={() => handleEdit(msg.id)}
                                >
                                  <Check className="size-3" /> {t.chat.save}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          msg.content && msg.content !== "(attachment)" && (
                            <div className="pl-0.5 text-sm leading-relaxed text-foreground/90 font-normal">
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            </div>
                          )
                        )}

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-2.5">
                            {msg.attachments.map((att, attIdx) => {
                              const isImage = att.fileType?.startsWith("image")
                              const attKey = att.id ?? `${msg.id}-att-${attIdx}`
                              return isImage ? (
                                <a key={attKey} href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                                  className="overflow-hidden rounded-xl shadow-sm transition-all border hover:opacity-90 hover:shadow-md">
                                  <img src={att.fileUrl} className="max-h-[360px] w-auto max-w-full object-contain bg-muted/20" alt={att.fileName} />
                                </a>
                              ) : (
                                <a key={attKey} href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex max-w-sm items-center gap-2.5 rounded-xl border bg-card px-3 py-2 shadow-sm transition-all hover:bg-accent/40">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <FileText className="size-4 text-muted-foreground" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-foreground">{att.fileName}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {att.fileSize ? (() => {
                                        const b = Number(att.fileSize)
                                        if (b >= 1024 * 1024 * 1024) return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`
                                        if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`
                                        if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`
                                        return `${b} B`
                                      })() : t.common.file}
                                    </p>
                                  </div>
                                </a>
                              )
                            })}
                          </div>
                        )}

                        {/* Reaction bar — grouped emoji counts */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {ALLOWED_REACTION_EMOJIS.map((emoji) => {
                              const reactors = msg.reactions!.filter((r) => r.emoji === emoji)
                              if (reactors.length === 0) return null
                              const mine = reactors.some((r) => r.userId === currentUserId)
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className={[
                                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all",
                                    mine
                                      ? "border-primary/40 bg-primary/10 text-primary font-medium"
                                      : "border-muted-foreground/20 bg-muted/40 text-foreground/70 hover:bg-muted/70",
                                  ].join(" ")}
                                  title={mine ? "Remove reaction" : "Add reaction"}
                                >
                                  <span>{emoji}</span>
                                  <span>{reactors.length}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Emoji quick-picker — visible on row hover */}
                      {!isEditing && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <div className="flex items-center gap-0.5 rounded-xl border bg-popover/95 px-1.5 py-1 shadow-md backdrop-blur-md">
                            {ALLOWED_REACTION_EMOJIS.map((emoji) => {
                              const mine = msg.reactions?.some(
                                (r) => r.emoji === emoji && r.userId === currentUserId
                              )
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className={[
                                    "flex size-7 items-center justify-center rounded-lg text-base transition-all hover:scale-125",
                                    mine ? "bg-primary/10" : "hover:bg-muted",
                                  ].join(" ")}
                                  title={mine ? `Remove ${emoji}` : `React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-44 rounded-xl border bg-popover/95 shadow-xl backdrop-blur-md p-1 animate-in fade-in zoom-in-95 duration-100">
                    {isOwnMessage ? (
                      <>
                        <ContextMenuItem
                          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground cursor-pointer transition-colors focus:bg-muted"
                          disabled={pending || isEditing}
                          onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content || "") }}
                        >
                          <Pencil className="size-3.5 text-muted-foreground" />
                          {t.chat.editMessage}
                        </ContextMenuItem>
                        <ContextMenuSeparator className="my-1 opacity-60" />
                        <ContextMenuItem
                          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive"
                          disabled={pending}
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 className="size-3.5" />
                          {t.chat.deleteMessage}
                        </ContextMenuItem>
                      </>
                    ) : (
                      <ContextMenuItem disabled className="text-[11px] text-muted-foreground/70 px-2.5 py-1.5">
                        {t.chat.noActions}
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="sticky bottom-0 shrink-0 bg-background/80 p-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl">
          <form onSubmit={handleSend} className="overflow-hidden rounded-2xl border bg-card shadow-lg backdrop-blur">
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-3 bg-muted/20 px-4 py-2">
                {pendingAttachments.map((att, i) => {
                  const isImg = att.fileType?.startsWith("image")
                  return (
                    <div key={`${att.fileUrl}-${i}`} className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
                      {isImg ? (
                        <img src={att.fileUrl} alt={att.fileName} className="max-h-22 w-auto object-contain" />
                      ) : (
                        <div className="flex items-center gap-2 p-3">
                          <FileText className="size-4" />
                          <span className="max-w-[140px] truncate text-xs font-medium">{att.fileName}</span>
                        </div>
                      )}
                      <Button
                        type="button" size="icon" variant="secondary"
                        className="absolute right-1.5 top-1.5 size-5 rounded-full shadow"
                        onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={canSend ? t.chat.messagePlaceholder.replace("{{channel}}", channel.name) : t.chat.noPermission}
              disabled={!canSend || pending}
              rows={1}
              className="min-h-[52px] resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center justify-end gap-2 bg-muted/5 px-4 py-2.5">
              <div className="flex items-center gap-1">
                {canUpload && canSend && (
                  <FileUpload
                    className="rounded-2xl"
                    classId={classData.id}
                    disabled={pending}
                    onUploaded={(file) => {
                      setPendingAttachments((prev) => [
                        ...prev,
                        { fileName: file.fileName, fileUrl: file.fileUrl, fileType: file.fileType, fileSize: file.fileSize },
                      ])
                    }}
                  />
                )}
              </div>
              <Button
                type="submit" size="icon"
                disabled={!canSubmit || pending}
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
