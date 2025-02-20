import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()

export type TweetInteraction = {
  likes: Array<{ user_id: string }>
  retweets: Array<{ user_id: string }>
  replies: Array<{ id: string }>
}

export async function toggleLike(tweetId: string, userId: string) {
  const { data: existingLike } = await supabase
    .from('likes')
    .select()
    .match({ tweet_id: tweetId, user_id: userId })
    .single()

  if (existingLike) {
    return supabase
      .from('likes')
      .delete()
      .match({ tweet_id: tweetId, user_id: userId })
  }

  return supabase
    .from('likes')
    .insert({ tweet_id: tweetId, user_id: userId })
}

export async function toggleRetweet(tweetId: string, userId: string) {
  const { data: existingRetweet } = await supabase
    .from('retweets')
    .select()
    .match({ tweet_id: tweetId, user_id: userId })
    .single()

  if (existingRetweet) {
    return supabase
      .from('retweets')
      .delete()
      .match({ tweet_id: tweetId, user_id: userId })
  }

  return supabase
    .from('retweets')
    .insert({ tweet_id: tweetId, user_id: userId })
}

export async function fetchTweetInteractions(tweetId: string): Promise<TweetInteraction> {
  const [{ data: likes }, { data: retweets }, { data: replies }] = await Promise.all([
    supabase.from('likes').select('user_id').eq('tweet_id', tweetId),
    supabase.from('retweets').select('user_id').eq('tweet_id', tweetId),
    supabase.from('tweets').select('id').eq('reply_to', tweetId),
  ])

  return {
    likes: likes || [],
    retweets: retweets || [],
    replies: replies || [],
  }
}
