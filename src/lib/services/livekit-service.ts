import { AccessToken, RoomServiceClient } from "livekit-server-sdk"

export function buildLiveKitRoomName(channelId: string): string {
  const slug = channelId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 48)
  return `oc-${slug || "room"}`
}

 export function getLiveKitServerUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_LIVEKIT_URL ??
    process.env.LIVEKIT_URL
  if (!url) {
    throw new Error("LIVEKIT_URL or NEXT_PUBLIC_LIVEKIT_URL is not configured")
  }
  return url
}

 function getLiveKitApiHost(): string {
  const wsUrl = getLiveKitServerUrl()
  return wsUrl.replace(/^wss:/i, "https:").replace(/^ws:/i, "http:")
}

function getRoomService(): RoomServiceClient {
  return new RoomServiceClient(
    getLiveKitApiHost(),
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  )
}

export async function createLiveKitRoom(roomName: string): Promise<void> {
  const svc = getRoomService()
  try {
    await svc.createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      maxParticipants: 50,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.toLowerCase().includes("already exists")) return
    throw e
  }
}

export async function deleteLiveKitRoom(roomName: string): Promise<void> {
  const svc = getRoomService()
  try {
    await svc.deleteRoom(roomName)
  } catch {
    // Room may already be gone
  }
}

export async function createLiveKitToken(
  roomName: string,
  options: { userId: string; userName: string; isHost: boolean }
): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  if (!apiKey || !apiSecret) {
    throw new Error("LIVEKIT_API_KEY and LIVEKIT_API_SECRET are required")
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: options.userId,
    name: options.userName,
    ttl: "6h",
  })

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  if (options.isHost) {
    token.addGrant({ roomAdmin: true })
  }

  return token.toJwt()
}
