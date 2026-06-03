import { notFound } from "next/navigation"
import { ChatView } from "@/components/workspace/chat-view"
import { VideoChannelView } from "@/components/workspace/video-channel-view"
import { loadChannel, loadClassBySlug } from "@/lib/workspace/load-data"

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ classSlug: string; channelId: string }>
}) {
  const { classSlug, channelId } = await params
  const classData = await loadClassBySlug(classSlug)
  const channel = await loadChannel(channelId)

  if (!classData || !channel || channel.classId !== classData.cls.id) {
    notFound()
  }

  if (channel.type === "video") {
    return <VideoChannelView channel={channel} classSlug={classSlug} />
  }

  return <ChatView channel={channel} />
}
