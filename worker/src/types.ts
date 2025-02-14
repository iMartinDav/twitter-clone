import type { Queue } from 'https://deno.land/x/queue@v1.0.0/mod.ts'

export interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  TWEET_QUEUE: Queue
}
