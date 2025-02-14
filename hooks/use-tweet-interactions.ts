import { useCallback, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, DatabaseLike } from '@/types/supabase'

interface TweetInteractions {
  likes: DatabaseLike[]
  retweets: any[]
  replies: any[]
}

export function useTweetInteractions() {
  const [interactions, setInteractions] = useState<Record<string, TweetInteractions>>({})
  const supabase = createClientComponentClient<Database>()

  const fetchTweetInteractions = useCallback(
    async (tweetId: string) => {
      try {
        const { data: likes } = await supabase.from('likes').select('*').eq('tweet_id', tweetId)

        setInteractions((prev) => ({
          ...prev,
          [tweetId]: {
            ...prev[tweetId],
            likes: likes || [],
            retweets: [],
            replies: [],
          },
        }))
      } catch (error) {
        console.error('Error fetching interactions:', error)
      }
    },
    [supabase],
  )

  const handleLike = useCallback(
    async (tweetId: string, userId: string) => {
      try {
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('tweet_id', tweetId)
          .eq('user_id', userId)
          .single()

        if (existingLike) {
          await supabase.from('likes').delete().eq('tweet_id', tweetId).eq('user_id', userId)
        } else {
          await supabase.from('likes').insert([{ tweet_id: tweetId, user_id: userId }])
        }

        await fetchTweetInteractions(tweetId)
      } catch (error) {
        console.error('Error handling like:', error)
      }
    },
    [supabase, fetchTweetInteractions],
  )

  return {
    interactions,
    fetchTweetInteractions,
    handleLike,
  }
}
