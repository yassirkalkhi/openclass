import { Index } from "@upstash/vector"

 
export type UpstashVectorMetadata = {
    mediaId: string
    chunkText: string
    /** Human-readable chapter title the resource belongs to (if any) */
    chapterTitle?: string
}

 if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    throw new Error(
        "Missing Upstash Vector credentials. Please verify UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN are defined in your .env file."
    )
}
 
export const vectorIndex = new Index<UpstashVectorMetadata>()