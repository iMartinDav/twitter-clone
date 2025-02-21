import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Tweet } from '@/types/tweet'
import type { Database } from '@/types/supabase'

export function useRealtimeTweets(initialTweets: Tweet[]) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const channel = supabase
      .channel('realtime-tweets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tweets'
      }, async (payload) => {
        switch (payload.eventType) {
          case 'INSERT': {
            const { data: newTweet } = await supabase
              .from('tweets')
              .select('*, user:profiles(full_name, username, avatar_url)')
              .eq('id', payload.new.id)
              .single()
            
            if (newTweet) {
              setTweets(current => [newTweet as Tweet, ...current])
            }
            break
          }
          case 'DELETE': {
            setTweets(current => current.filter(tweet => tweet.id !== payload.old.id))
            break
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const addTweet = (newTweet: Tweet) => {
    setTweets(current => [newTweet, ...current])
  }

  const removeTweet = (tweetId: string) => {
    setTweets(current => current.filter(tweet => tweet.id !== tweetId))
  }

  return {
    tweets,
    addTweet,
    removeTweet
  }
}
