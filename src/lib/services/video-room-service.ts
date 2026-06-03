import { VideoRoomRepository } from "@/lib/repositories/video-room-repository"
import { ChannelRepository } from "@/lib/repositories/channel-repository"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { PermissionService } from "./permission-service"
import { NotificationService } from "./notification-service"
import { ChatService } from "./chat-service"
import {
  buildLiveKitRoomName,
  createLiveKitRoom,
  createLiveKitToken,
  deleteLiveKitRoom,
  getLiveKitServerUrl,
} from "./livekit-service"
import { generateId } from "@/lib/utils"
import { normalizeClassRole } from "@/lib/permissions/normalize-roles"
import type { VideoRoom } from "@/lib/types/database"

const videoRoomRepository = new VideoRoomRepository()
const channelRepository = new ChannelRepository()
const profileRepository = new ProfileRepository()
const permissionService = new PermissionService()
const notificationService = new NotificationService()
const chatService = new ChatService()

function resolveRoomName(room: VideoRoom): string | null {
  return room.livekitRoomName ?? room.dailyRoomName ?? null
}

export class VideoRoomService {
  async getRoomForChannel(channelId: string, userId: string): Promise<VideoRoom | null> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")
    await permissionService.requireMembership(channel.classId, userId)
    return videoRoomRepository.getByChannel(channelId)
  }

  async ensureRoomRecord(
    channelId: string,
    classId: string,
    title: string,
    userId: string
  ): Promise<VideoRoom> {
    const existing = await videoRoomRepository.getByChannel(channelId)
    if (existing) return existing

    const now = new Date().toISOString()
    const room: VideoRoom = {
      id: generateId(),
      classId,
      channelId,
      title,
      active: false,
      createdBy: userId,
      createdAt: now,
    }
    await videoRoomRepository.create(room)
    return room
  }

  async startSession(channelId: string, userId: string, classSlug: string): Promise<VideoRoom> {
    const channel = await channelRepository.getById(channelId)
    if (!channel || channel.type !== "video") {
      throw new Error("Not a video channel")
    }

    await permissionService.requireRole(channel.classId, userId, "teacher")

    let room = await this.ensureRoomRecord(channelId, channel.classId, channel.name, userId)

    if (room.active && resolveRoomName(room)) {
      return room
    }

    const livekitRoomName = buildLiveKitRoomName(channelId)
    await createLiveKitRoom(livekitRoomName)
    const now = new Date().toISOString()

    await videoRoomRepository.update(room.id, {
      active: true,
      livekitRoomName,
      dailyRoomName: undefined,
      dailyRoomUrl: undefined,
      startedAt: now,
      endedAt: undefined,
    })

    room = (await videoRoomRepository.getById(room.id))!

    const joinPath = `/app/${classSlug}/channels/${channelId}`
    const hostProfile = await profileRepository.getById(userId)
    const hostName = hostProfile?.fullName ?? "Your teacher"

    await this.postSessionAnnouncement(
      channel.classId,
      userId,
      channel.name,
      hostName,
      joinPath
    )

    await notificationService.notifyClassStudents(
      channel.classId,
      {
        type: "announcement",
        title: `Live video: #${channel.name}`,
        content: `${hostName} started a live session. Open ${joinPath} to join.`,
      },
      userId
    )

    return room
  }

  async getJoinCredentials(
    channelId: string,
    userId: string
  ): Promise<{
    serverUrl: string
    roomName: string
    token: string
    active: boolean
  }> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requirePermission(channel.classId, userId, "join_video")

    const room = await videoRoomRepository.getActiveByChannel(channelId)
    const roomName = room ? resolveRoomName(room) : null

    if (!room?.active || !roomName) {
      throw new Error("No active video session")
    }

    const member = await permissionService.requireMembership(channel.classId, userId)
    const profile = await profileRepository.getById(userId)
    const isHost = normalizeClassRole(member.role) === "teacher"

    const token = await createLiveKitToken(roomName, {
      userId,
      userName: profile?.fullName ?? profile?.email ?? "Participant",
      isHost,
    })

    return {
      serverUrl: getLiveKitServerUrl(),
      roomName,
      token,
      active: true,
    }
  }

  async endSession(channelId: string, userId: string): Promise<void> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireRole(channel.classId, userId, "teacher")

    const room = await videoRoomRepository.getActiveByChannel(channelId)
    if (!room) return

    const roomName = resolveRoomName(room)
    if (roomName) {
      await deleteLiveKitRoom(roomName)
    }

    await videoRoomRepository.update(room.id, {
      active: false,
      endedAt: new Date().toISOString(),
      livekitRoomName: undefined,
      dailyRoomName: undefined,
      dailyRoomUrl: undefined,
    })
  }

  private async postSessionAnnouncement(
    classId: string,
    hostUserId: string,
    channelName: string,
    hostName: string,
    joinPath: string
  ): Promise<void> {
    const announcementChannels = await channelRepository.getByClassAndType(
      classId,
      "announcement"
    )
    const annChannel =
      announcementChannels.find((c) => c.name === "announcements") ??
      announcementChannels[0]

    if (!annChannel) return

    const content = `📹 **Live session started** — ${hostName} is hosting a video meeting in **#${channelName}**.\n\nJoin now: ${joinPath}`

    await chatService.sendMessage(annChannel.id, hostUserId, content)
  }
}
