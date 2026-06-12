import { ChannelRepository } from "@/lib/repositories/channel-repository"
import { ChannelCategoryRepository } from "@/lib/repositories/channel-category-repository"
import { MessageRepository } from "@/lib/repositories/message-repository"
import { VideoRoomRepository } from "@/lib/repositories/video-room-repository"
import { PermissionService } from "./permission-service"
import { generateId } from "@/lib/utils"
import type { Channel, ChannelCategory } from "@/lib/types/database"

const channelRepository = new ChannelRepository()
const categoryRepository = new ChannelCategoryRepository()
const messageRepository = new MessageRepository()
const videoRoomRepository = new VideoRoomRepository()
const permissionService = new PermissionService()

export class ChannelService {
 
  async createChannel(
    data: Pick<Channel, "classId" | "name" | "type"> & {
      description?: string
      categoryId?: string
    },
    userId: string
  ): Promise<Channel> {
    await permissionService.requireRole(data.classId, userId, "teacher")

    const maxPosition = await channelRepository.getMaxPosition(data.classId)
    const now = new Date().toISOString()

    const channel: Channel = {
      id: generateId(),
      classId: data.classId,
      categoryId: data.categoryId,
      name: data.name,
      description: data.description,
      type: data.type,
      position: maxPosition + 1,
      createdBy: userId,
      createdAt: now,
    }
    await channelRepository.create(channel)

    if (data.type === "video") {
      const now = new Date().toISOString()
      await videoRoomRepository.create({
        id: generateId(),
        classId: data.classId,
        channelId: channel.id,
        title: channel.name,
        active: false,
        createdBy: userId,
        createdAt: now,
      })
    }

    return channel
  }
 
  async updateChannel(
    channelId: string,
    data: Partial<Pick<Channel, "name" | "description" | "categoryId">>,
    userId: string
  ): Promise<void> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireRole(channel.classId, userId, "teacher")

    await channelRepository.update(channelId, data)
  }
 
  async deleteChannel(channelId: string, userId: string): Promise<void> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) throw new Error("Channel not found")

    await permissionService.requireRole(channel.classId, userId, "teacher")

     await messageRepository.deleteByChannel(channelId)

    const videoRoom = await videoRoomRepository.getByChannel(channelId)
    if (videoRoom) {
      await videoRoomRepository.delete(videoRoom.id)
    }

     await channelRepository.delete(channelId)
  }

   
  async reorderChannels(
    classId: string,
    channelIds: string[],
    userId: string
  ): Promise<void> {
    await permissionService.requireRole(classId, userId, "teacher")
    await channelRepository.reorder(channelIds)
  }

   
  async getChannels(classId: string, userId: string): Promise<Channel[]> {
    await permissionService.requireMembership(classId, userId)
    return channelRepository.getByClass(classId)
  }

 
  async getChannelsByType(
    classId: string,
    type: Channel["type"],
    userId: string
  ): Promise<Channel[]> {
    await permissionService.requireMembership(classId, userId)
    return channelRepository.getByClassAndType(classId, type)
  }

 
  async getChannel(channelId: string, userId: string): Promise<Channel | null> {
    const channel = await channelRepository.getById(channelId)
    if (!channel) return null

    await permissionService.requireMembership(channel.classId, userId)
    return channel
  }

 
  async createCategory(
    classId: string,
    name: string,
    userId: string
  ): Promise<ChannelCategory> {
    await permissionService.requireRole(classId, userId, "teacher")

    const maxPosition = await categoryRepository.getMaxPosition(classId)
    const now = new Date().toISOString()

    const category: ChannelCategory = {
      id: generateId(),
      classId,
      name,
      position: maxPosition + 1,
      createdAt: now,
    }
    await categoryRepository.create(category)

    return category
  }

  
  async updateCategory(
    categoryId: string,
    name: string,
    userId: string
  ): Promise<void> {
    const category = await categoryRepository.getById(categoryId)
    if (!category) throw new Error("Category not found")

    await permissionService.requireRole(category.classId, userId, "teacher")

    await categoryRepository.update(categoryId, { name })
  }
 
  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    const category = await categoryRepository.getById(categoryId)
    if (!category) throw new Error("Category not found")

    await permissionService.requireRole(category.classId, userId, "teacher")

     const channels = await channelRepository.getByCategory(categoryId)
    for (const channel of channels) {
      await channelRepository.update(channel.id, { categoryId: undefined })
    }

    await categoryRepository.delete(categoryId)
  }

 
  async reorderCategories(
    classId: string,
    categoryIds: string[],
    userId: string
  ): Promise<void> {
    await permissionService.requireRole(classId, userId, "teacher")
    await categoryRepository.reorder(categoryIds)
  }
 
  async getCategories(classId: string, userId: string): Promise<ChannelCategory[]> {
    await permissionService.requireMembership(classId, userId)
    return categoryRepository.getByClass(classId)
  }
}
