import { useState, useEffect, useContext } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TweetInteractionsContext } from '@/contexts/tweet-interactions-context'
import type { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()

export function useTweetInteractions(tweetId?: string) {
  const context = useContext(TweetInteractionsContext)
  if (!context) {
    throw new Error('useTweetInteractions must be used within a TweetInteractionsProvider')
  }

  const { interactions } = context
  const tweetInteractions = tweetId ? interactions[tweetId] : undefined
  const [userId, setUserId] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id)
    })
  }, [])

  return {
    ...context,
    currentInteractions: tweetInteractions,
    isLiked: Boolean(tweetId && tweetInteractions?.likes?.some(like => like.user_id === userId)),
    isRetweeted: Boolean(tweetId && tweetInteractions?.retweets?.some(retweet => retweet.user_id === userId)),
  }
}
