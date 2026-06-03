import { Index } from "@upstash/vector"

/**
 * Global Type Definition for your Upstash vector payload metadata schema.
 * This guarantees type safety across your ingest pipelines and chat services.
 */
export type UpstashVectorMetadata = {
    mediaId: string
    chunkText: string
}

// Ensure your environment variables are configured correctly before running
if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    throw new Error(
        "Missing Upstash Vector credentials. Please verify UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN are defined in your .env file."
    )
}

/**
 * Shared Upstash Vector Instance
 * Natively acts as a connection pooler inside serverless environments (Next.js Edge / Cloudflare Workers)
 */
export const vectorIndex = new Index<UpstashVectorMetadata>()