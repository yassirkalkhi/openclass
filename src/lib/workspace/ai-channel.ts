/** Reserved channel-style path segment for the class AI assistant (not a Firestore channel). */
export const AI_ASSISTANT_CHANNEL_SLUG = "ai-assistant"

export function aiAssistantChannelHref(classSlug: string) {
  return `/app/${classSlug}/channels/${AI_ASSISTANT_CHANNEL_SLUG}`
}
