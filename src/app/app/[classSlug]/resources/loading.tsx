import { Loader2 } from "lucide-react"

export default function ResourcesLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading resources...</p>
      </div>
    </div>
  )
}
