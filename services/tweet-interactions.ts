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

export async function createReply(tweetId: string, content: string, userId: string) {
  try {
    if (!content || !tweetId || !userId) {
      throw new Error('Missing required fields for reply')
    }

    // Create the tweet first
    const { data: newTweet, error: tweetError } = await supabase
      .from('tweets')
      .insert({
        content: content.trim(),
        user_id: userId,
        reply_to: tweetId
      })
      .select(`
        *,
        user:profiles(full_name, username, avatar_url)
      `)
      .single()

    if (tweetError) {
      console.error('Tweet creation error:', tweetError)
      throw new Error(`Failed to create reply tweet: ${tweetError.message}`)
    }

    return newTweet
  } catch (error) {
    console.error('Error creating reply:', error)
    throw error instanceof Error ? error : new Error('Failed to create reply')
  }
}

export async function fetchReplies(tweetId: string) {
  try {
    const { data, error } = await supabase
      .from('replies')
      .select(`
        *,
        profile:profiles!replies_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('tweet_id', tweetId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching replies:', error)
    throw error
  }
}

export async function fetchTweetInteractions(tweetId: string): Promise<TweetInteraction> {
  const [{ data: likes }, { data: retweets }, { data: replies }] = await Promise.all([
    supabase.from('likes').select('user_id').eq('tweet_id', tweetId),
    supabase.from('retweets').select('user_id').eq('tweet_id', tweetId),
    supabase.from('replies').select('id').eq('tweet_id', tweetId),
  ])

  return {
    likes: likes || [],
    retweets: retweets || [],
    replies: replies || [],
  }
}
