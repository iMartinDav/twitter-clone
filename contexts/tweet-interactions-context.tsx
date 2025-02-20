'use client'

import React, { createContext, useState, useCallback, useEffect, useContext } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { fetchTweetInteractions, type TweetInteraction } from '@/services/tweet-interactions'
import type { Database } from '@/types/supabase'

interface TweetInteractionsContextType {
  interactions: Record<string, TweetInteraction>
  fetchTweetInteractions: (tweetId: string) => Promise<void>
  fetchTweetInteractionsInBulk: (tweetIds: string[]) => Promise<void>
  clearInteractions: () => void
}

export const TweetInteractionsContext = createContext<TweetInteractionsContextType | undefined>(undefined)

interface ProviderProps {
  children: React.ReactNode
}

const supabase = createClientComponentClient<Database>()

function TweetInteractionsProvider({ children }: ProviderProps) {
  const [interactions, setInteractions] = useState<Record<string, TweetInteraction>>({})

  const clearInteractions = useCallback(() => {
    setInteractions({})
  }, [])

  const handleFetchInteractions = useCallback(async (tweetId: string) => {
    try {
      const data = await fetchTweetInteractions(tweetId)
      setInteractions(prev => ({ ...prev, [tweetId]: data }))
    } catch (error) {
      console.error('Error fetching interactions:', error)
    }
  }, [])

  const handleFetchBulkInteractions = useCallback(async (tweetIds: string[]) => {
    const uniqueIds = [...new Set(tweetIds)]
    const idsToFetch = uniqueIds.filter(id => !interactions[id])

    if (idsToFetch.length === 0) return

    try {
      const fetchPromises = idsToFetch.map(fetchTweetInteractions)
      const results = await Promise.all(fetchPromises)
      
      const newInteractions: Record<string, TweetInteraction> = {}
      idsToFetch.forEach((id, index) => {
        newInteractions[id] = results[index]
      })

      setInteractions(prev => ({ ...prev, ...newInteractions }))
    } catch (error) {
      console.error('Error fetching bulk interactions:', error)
    }
  }, [interactions])

  useEffect(() => {
    const channels = ['likes', 'retweets', 'tweets'].map(table => 
      supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload: { new: { tweet_id?: string } | null; old: { tweet_id?: string } | null }) => {
            const tweetId = payload.new?.tweet_id || payload.old?.tweet_id
            if (tweetId && interactions[tweetId]) {
              handleFetchInteractions(tweetId)
            }
          }
        )
        .subscribe()
    )

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [handleFetchInteractions, interactions])

  const value = {
    interactions,
    fetchTweetInteractions: handleFetchInteractions,
    fetchTweetInteractionsInBulk: handleFetchBulkInteractions,
    clearInteractions,
  }

  return (
    <TweetInteractionsContext.Provider value={value}>
      {children}
    </TweetInteractionsContext.Provider>
  )
}

function useTweetInteractions(tweetId?: string) {
  const context = useContext(TweetInteractionsContext)
  if (!context) {
    throw new Error('useTweetInteractions must be used within a TweetInteractionsProvider')
  }

  const { interactions } = context
  const tweetInteractions = tweetId ? interactions[tweetId] : undefined

  // Create a stable reference to the current user ID
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

export { 
  TweetInteractionsProvider,  // The provider component
  useTweetInteractions        // The hook to use the context
}
