import type { Queue } from '@cloudflare/workers-types'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  TWEET_QUEUE: Queue
  JWT_SECRET: string
}

export interface QueueMessage {
  tweetId: string
  userId: string
  content: string
  timestamp: number
}
