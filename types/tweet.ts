// types/tweet.ts
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from './supabase'

export interface Tweet {
  [x: string]: any
  id: string
  content: string
  created_at: string
  user_id: string
  isReply?: boolean
  replyCount?: number
  replies?: Tweet[]
  profile: {
    full_name: string
    username: string
    avatar_url: string
  }
}

export interface TweetInteraction {
  id: string
  user_id: string
  tweet_id: string
  created_at: string
}

export interface TweetInteractions {
  likes: TweetInteraction[]
  retweets: TweetInteraction[]
  replies: TweetInteraction[]
}

export type InteractionPayload = RealtimePostgresChangesPayload<
  Database['public']['Tables']['likes']['Row']
>
