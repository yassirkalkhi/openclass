export const ALLOWED_REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"] as const
export type AllowedEmoji = (typeof ALLOWED_REACTION_EMOJIS)[number]
