"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createChannelAction } from "@/app/actions/channel"
import { useClass } from "@/context/class-context"
import type { Channel } from "@/lib/types/database"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { normalizeChannelName } from "@/lib/workspace/channel-name"
import { useI18n } from "@/lib/i18n/context"

export function CreateChannelDialog({
  classSlug,
  trigger,
}: {
  classSlug: string
  trigger?: React.ReactNode
}) {
  const { classData } = useClass()
  const router = useRouter()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<Channel["type"]>("text")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCreate() {
    setError(null)
    let channelName: string
    try {
      channelName = normalizeChannelName(name)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.channels.invalidName)
      return
    }

    startTransition(async () => {
      const result = await createChannelAction(classData.id, {
        name: channelName,
        type,
        description: description.trim() || undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      setName("")
      setDescription("")
      setType("text")
      router.push(`/app/${classSlug}/channels/${result.data!.id}`)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon-xs" title={t.channels.addChannel}>
            <Plus className="size-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.channels.create}</DialogTitle>
          <DialogDescription>{t.channels.createDesc}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="channel-name">{t.channels.name}</Label>
            <Input
              id="channel-name"
              placeholder={t.channels.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="channel-type">{t.channels.type}</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as Channel["type"])}
              disabled={pending}
            >
              <SelectTrigger id="channel-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t.channels.typeText}</SelectItem>
                <SelectItem value="video">{t.channels.typeVideo}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="channel-desc">{t.channels.descriptionOptional}</Label>
            <Input
              id="channel-desc"
              placeholder={t.channels.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={pending}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleCreate} disabled={pending || !name.trim()}>
            {pending ? t.channels.creating : t.channels.createBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
