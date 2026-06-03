import { redirect } from "next/navigation"
import { aiAssistantChannelHref } from "@/lib/workspace/ai-channel"

export default async function LegacyAIAssistantRedirect({
  params,
}: {
  params: Promise<{ classSlug: string }>
}) {
  const { classSlug } = await params
  redirect(aiAssistantChannelHref(classSlug))
}
