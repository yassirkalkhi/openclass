export interface Organization {
  id: string
  name: string
  slug: string
  description?: string 
  ownerId: string
  type: "school" | "university" | "academy" | "company"
  visibility: "private" | "public"
  inviteCode?: string
  subscriptionId?: string
  subscriptionStatus?: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  videoFeatureEnabled?: boolean
  aiFeatureEnabled?: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: "owner" | "member"
  createdAt: string
}



export interface Profile {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  status?: string
  passwordHash?: string
  platformAdmin?: boolean
  organizationIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface Class {
  id: string
  organizationId: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  inviteCode: string
  ownerId: string
  visibility: "private" | "public"
  archived?: boolean
  createdAt: string
  updatedAt: string
}



export interface ClassMember {
  id: string
  classId: string
  userId: string
  role: "teacher" | "student"
  joinedAt: string
  profile?: Profile
}

export interface Channel {
  id: string
  classId: string
  categoryId?: string
  name: string
  description?: string
  type: "text" | "video" | "announcement"
  position: number
  createdBy: string
  createdAt: string
}

export interface ChannelCategory {
  id: string
  classId: string
  name: string
  position: number
  createdAt: string
}

export interface Assignment {
  id: string
  classId: string
  channelId?: string
  createdBy: string

  title: string
  description?: string

  attachments?: string[]

  dueDate?: string
  maxScore?: number

  allowLateSubmission: boolean

  createdAt: string
  updatedAt?: string
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  classId: string
  studentId: string

  content?: string
  attachments?: MessageAttachment[]

  status: "draft" | "submitted" | "late" | "graded"

  score?: number
  feedback?: string

  submittedAt?: string
  gradedAt?: string
  createdAt: string
}


export interface Message {
  id: string
  channelId: string
  senderId: string
  content: string
  replyToId?: string
  edited: boolean
  pinned?: boolean
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  createdAt: string
  updatedAt?: string
  senderProfile?: Profile
}

export interface MessageAttachment {
  id: string
  messageId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface ResourceChapter {
  id: string
  classId: string
  title: string
  description?: string
  position: number
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface ClassResource {
  id: string
  classId: string
  uploadedBy: string

  chapterId?: string  // which chapter this resource belongs to (undefined = uncategorized)

  title: string
  description?: string

  fileName: string   // original file name as uploaded
  fileUrl: string
  fileType: string
  fileSize: number

  tags?: string[]

  linkedAssignmentId?: string

  aiIndexed: boolean

  createdAt: string
}

export interface AIConversation {
  id: string
  classId: string
  userId: string
  title?: string
  createdAt: string
}

export interface AIMessage {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  sources?: AISource[]
  createdAt: string
}

export interface AISource {
  id: string
  title: string
  type: string
  url?: string
}

export interface EmbeddingChunk {
  id: string
  mediaId: string
  chunkText: string
  embeddingId: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface ClassInvitation {
  id: string
  classId: string
  organizationId: string
  inviteeUserId: string
  inviterUserId: string
  role: ClassMember["role"]
  status: "pending" | "accepted" | "rejected" | "cancelled"
  message?: string
  createdAt: string
  respondedAt?: string
}

export interface Notification {
  id: string
  userId: string
  type: "message" | "mention" | "invite" | "announcement"
  title: string
  content?: string
  read: boolean
  createdAt: string
  invitationId?: string
  classId?: string
}




export interface VideoRoom {
  id: string
  classId: string
  channelId: string
  title: string
  active: boolean
  recordingEnabled?: boolean
  /** @deprecated Legacy Daily field — use livekitRoomName */
  dailyRoomName?: string
  /** @deprecated Legacy Daily field */
  dailyRoomUrl?: string
  livekitRoomName?: string
  startedAt?: string
  endedAt?: string
  createdBy: string
  createdAt: string
}

export interface Subscription {
  id: string
  organizationId: string
  polarSubscriptionId: string
  polarCustomerId: string
  status: "active" | "past_due" | "canceled" | "incomplete" | "trialing"
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  videoFeatureEnabled: boolean
  aiFeatureEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface BillingTransaction {
  id: string
  organizationId: string
  subscriptionId: string
  polarInvoiceId?: string
  amount: number
  currency: string
  status: "pending" | "paid" | "failed" | "refunded"
  description: string
  createdAt: string
}

export interface UserPresence {
  userId: string
  classId: string
  status: "online" | "offline" | "idle" | "dnd"
  lastSeenAt: string
}

export interface Permission {
  key:
  | "manage_organization"
  | "manage_class"
  | "manage_roles"
  | "send_messages"
  | "upload_files"
  | "join_voice"
  | "join_video"
  | "use_ai"

  enabled: boolean
}

export type PermissionKey = Permission["key"]

export type PermissionOverrides = Partial<
  Record<"teacher" | "student", Partial<Record<PermissionKey, boolean>>>
>

export interface ClassSettings {
  id: string
  classId: string
  allowStudentUploads: boolean
  allowAIAccess: boolean
  permissionOverrides?: PermissionOverrides
  createdAt: string
}

export interface DatabaseSchema {
  organizations: Organization[]
  organizationMembers: OrganizationMember[]


  profiles: Profile[]

  classes: Class[]
  classMembers: ClassMember[]

  channels: Channel[]

  messages: Message[]
  messageAttachments: MessageAttachment[]
  messageReactions: MessageReaction[]

  resourceChapters: ResourceChapter[]
  classResources: ClassResource[]

  aiConversations: AIConversation[]
  aiMessages: AIMessage[]
  embeddingChunks: EmbeddingChunk[]

  notifications: Notification[]
  classInvitations: ClassInvitation[]

  classSettings: ClassSettings[]

  videoRooms: VideoRoom[]
  userPresence: UserPresence[]
  
  subscriptions: Subscription[]
  billingTransactions: BillingTransaction[]
}