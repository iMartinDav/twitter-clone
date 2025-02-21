// types/tweet.ts
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type BaseTweet = Database['public']['Tables']['tweets']['Row']

export interface Tweet extends BaseTweet {
    profiles: Profile
    user: Profile
    likes_count?: { count: number }[]
    user_has_liked?: { user_id: string }[]
    reply_to: string | null
    retweet_id: string | null
    retweeted_tweet?: Tweet | null
    reply_to_user?: Profile
    has_replies?: boolean // Changed from replies: boolean
    replies_count: number
}

export interface TweetWithReplies extends Omit<Tweet, 'has_replies'> {
    replies: Tweet[]
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
