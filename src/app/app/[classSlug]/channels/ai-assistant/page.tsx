import { Suspense } from "react"
import { AIAssistantChannelPage } from "@/components/workspace/ai-assistant-channel-page"

export default function Page() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <AIAssistantChannelPage />
    </Suspense>
  )
}
