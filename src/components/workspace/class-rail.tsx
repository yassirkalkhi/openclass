"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Class } from "@/lib/types/database"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, memo } from "react"
import { createClassAction } from "@/app/actions/class"
import { useI18n } from "@/lib/i18n/context"

const ClassButton = memo(({ cls, active }: { cls: Class; active: boolean }) => (
  <Link
    href={`/app/${cls.slug}`}
    title={cls.name}
    className={cn(
      "flex size-10 items-center justify-center rounded-lg text-xs font-semibold transition-colors",
      active
        ? "bg-sidebar-primary text-sidebar-primary-foreground"
        : "bg-muted text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    {cls.name.slice(0, 2).toUpperCase()}
  </Link>
))
ClassButton.displayName = "ClassButton"

export function ClassRail({ classes }: { classes: Class[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isOrgOwner } = useAuth()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleCreate(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createClassAction({
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      visibility: "private",
    })
    setPending(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setOpen(false)
    if (result.data) router.push(`/app/${result.data.slug}`)
    router.refresh()
  }

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-r bg-sidebar py-3">
      {classes.map((cls) => {
        const active = pathname.startsWith(`/app/${cls.slug}`)
        return <ClassButton key={cls.id} cls={cls} active={active} />
      })}

      {isOrgOwner && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="size-10 rounded-lg border-dashed"
              title={t.classes.create}
            >
              <Plus className="size-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.classes.create}</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="name">{t.classes.nameLabel}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t.organizations.slugLabel}</Label>
                <Input id="slug" name="slug" required pattern="[a-z0-9-]+" />
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? t.common.loading : t.common.create}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  )
}
