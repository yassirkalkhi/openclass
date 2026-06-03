export function normalizeChannelName(raw: string): string {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  if (normalized.length < 2) {
    throw new Error("Channel name must be at least 2 characters")
  }
  if (normalized.length > 32) {
    throw new Error("Channel name must be 32 characters or fewer")
  }
  if (["general", "announcements", "ai-assistant"].includes(normalized)) {
    throw new Error("This channel name is reserved")
  }
  return normalized
}
