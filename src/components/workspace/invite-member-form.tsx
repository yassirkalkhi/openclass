"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { Search, UserPlus, Loader2, X } from "lucide-react"
import type { ClassMember, Profile } from "@/lib/types/database"
import {
  searchClassInviteCandidatesAction,
  sendClassInvitationAction,
} from "@/app/actions/invitation"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"

export function InviteMemberForm({
  classId,
  onSent,
}: {
  classId: string
  onSent: () => void
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [role, setRole] = useState<ClassMember["role"]>("student")
  const [message, setMessage] = useState("")
  const [candidates, setCandidates] = useState<Profile[]>([])
  const [selected, setSelected] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [searching, startSearch] = useTransition()
  const [sending, startSend] = useTransition()

  const runSearch = useCallback(
    (q: string) => {
      startSearch(async () => {
        const result = await searchClassInviteCandidatesAction(classId, q)
        if (result.success && result.data) setCandidates(result.data)
      })
    },
    [classId]
  )

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 280)
    return () => clearTimeout(timer)
  }, [query, runSearch])

  useEffect(() => { runSearch("") }, [runSearch])

  function handleSend() {
    if (!selected) return
    setError(null)
    setSuccess(false)
    startSend(async () => {
      const result = await sendClassInvitationAction(
        classId,
        selected.id,
        role,
        message.trim() || undefined
      )
      if (!result.success) { setError(result.error); return }
      setSuccess(true)
      setSelected(null)
      setMessage("")
      setQuery("")
      onSent()
      setTimeout(() => setSuccess(false), 2500)
    })
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-medium">{t.members.invite}</h2>
      </div>
      <p className="text-xs text-muted-foreground">{t.members.inviteDesc}</p>

      {selected ? (
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
          <UserAvatar
            name={selected.fullName}
            email={selected.email}
            avatarUrl={selected.avatarUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{selected.fullName ?? selected.email}</p>
            <p className="text-xs text-muted-foreground truncate">{selected.email}</p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSelected(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.members.searchPlaceholder}
              className="h-9 pl-8 text-sm"
            />
            {searching && (
              <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
          {candidates.length > 0 && (
            <ul className="max-h-40 overflow-auto rounded-md border bg-background divide-y">
              {candidates.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => { setSelected(p); setCandidates([]) }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
                  >
                    <UserAvatar name={p.fullName} email={p.email} avatarUrl={p.avatarUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.fullName ?? p.email}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{p.email}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!searching && candidates.length === 0 && query && (
            <p className="text-xs text-muted-foreground px-1">{t.members.noMatchingMembers}</p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{t.members.role}</Label>
          <div className="flex rounded-md border bg-background p-0.5">
            {(["student", "teacher"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "flex-1 rounded px-2 py-1.5 text-xs font-medium capitalize transition-all",
                  role === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r === "student" ? t.members.student : t.members.teacher}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">{t.members.optionalMessage}</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.members.messagePlaceholder}
            rows={2}
            className="text-sm resize-none"
          />
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {success && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400">{t.members.invitationSent}</p>
      )}

      <Button
        type="button"
        size="sm"
        disabled={!selected || sending}
        onClick={handleSend}
        className="w-full sm:w-auto"
      >
        {sending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        {t.members.sendInvitation}
      </Button>
    </div>
  )
}
