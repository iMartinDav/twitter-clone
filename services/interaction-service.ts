import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()

export interface TweetInteraction {
  likes: Array<{ user_id: string; created_at: string }>
  retweets: Array<{ user_id: string; created_at: string }>
  replies: Array<{ id: string; content: string; user_id: string; created_at: string }>
}

export const handleLikeTweet = async (tweetId: string, userId: string) => {
  const { data: existingLike, error: fetchError } = await supabase
    .from('likes')
    .select('*')
    .eq('tweet_id', tweetId)
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error('Failed to check like status')
  }

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('tweet_id', tweetId)
      .eq('user_id', userId)

    if (deleteError) throw new Error('Failed to unlike tweet')
  } else {
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ tweet_id: tweetId, user_id: userId }])

    if (insertError) throw new Error('Failed to like tweet')
  }
}

export const handleRetweetAction = async (tweetId: string, userId: string) => {
  const { data: existingRetweet, error: fetchError } = await supabase
    .from('retweets')
    .select('*')
    .eq('tweet_id', tweetId)
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error('Failed to check retweet status');
  }

  if (existingRetweet) {
    const { error: deleteError } = await supabase
      .from('retweets')
      .delete()
      .eq('tweet_id', tweetId)
      .eq('user_id', userId);

    if (deleteError) throw new Error('Failed to unretweet');
  } else {
    const { error: insertError } = await supabase
      .from('retweets')
      .insert([{ tweet_id: tweetId, user_id: userId }]);

    if (insertError) throw new Error('Failed to retweet');
  }
};

export const fetchTweetInteractions = async (tweetId: string): Promise<TweetInteraction> => {
  try {
    const [likesResponse, retweetsResponse, repliesResponse] = await Promise.all([
      supabase.from('likes').select('user_id, created_at').eq('tweet_id', tweetId),
      supabase.from('retweets').select('user_id, created_at').eq('tweet_id', tweetId),
      supabase.from('tweets').select('id, content, user_id, created_at').eq('reply_to', tweetId),
    ])

    return {
      likes: likesResponse.data || [],
      retweets: retweetsResponse.data || [],
      replies: repliesResponse.data || [],
    }
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return {
      likes: [],
      retweets: [],
      replies: [],
    }
  }
}

export const fetchTweetInteractionsInBulk = async (tweetIds: string[]) => {
  if (!tweetIds.length) return {}

  try {
    const [likesResponse, retweetsResponse, repliesResponse] = await Promise.all([
      supabase.from('likes').select('tweet_id, user_id, created_at').in('tweet_id', tweetIds),
      supabase.from('retweets').select('tweet_id, user_id, created_at').in('tweet_id', tweetIds),
      supabase.from('tweets').select('id, content, user_id, created_at, reply_to').in('reply_to', tweetIds),
    ])

    const interactionsMap: Record<string, TweetInteraction> = {}

    tweetIds.forEach((tweetId) => {
      interactionsMap[tweetId] = {
        likes: likesResponse.data?.filter((like) => like.tweet_id === tweetId) || [],
        retweets: retweetsResponse.data?.filter((retweet) => retweet.tweet_id === tweetId) || [],
        replies: repliesResponse.data?.filter((reply) => reply.reply_to === tweetId) || [],
      }
    })

    return interactionsMap
  } catch (error) {
    console.error('Error fetching bulk interactions:', error)
    return tweetIds.reduce((acc, tweetId) => {
      acc[tweetId] = {
        likes: [],
        retweets: [],
        replies: [],
      }
      return acc
    }, {} as Record<string, TweetInteraction>)
  }
}
