'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { fetchTweetInteractions, fetchTweetInteractionsInBulk, TweetInteraction } from '@/services/interaction-service'

interface TweetInteractionsContextType {
  interactions: Record<string, TweetInteraction>
  fetchTweetInteractions: (tweetId: string) => Promise<void>
  fetchTweetInteractionsInBulk: (tweetIds: string[]) => Promise<void>
}

const TweetInteractionsContext = createContext<TweetInteractionsContextType | undefined>(undefined)

export const TweetInteractionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [interactions, setInteractions] = useState<Record<string, TweetInteraction>>({});

  const handleFetchInteractions = useCallback(async (tweetId: string) => {
    try {
      const data = await fetchTweetInteractions(tweetId);
      setInteractions(prev => ({ ...prev, [tweetId]: data }));
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  }, []);

  const handleFetchBulkInteractions = useCallback(async (tweetIds: string[]) => {
    try {
      const data = await fetchTweetInteractionsInBulk(tweetIds);
      const interactionsMap: Record<string, TweetInteraction> = {};
      if (data && Array.isArray(data)) {
        data.forEach(interaction => {
          if (interaction && interaction.tweet_id) {
            interactionsMap[interaction.tweet_id] = interaction;
          }
        });
      }
      setInteractions(prev => ({ ...prev, ...interactionsMap }));
    } catch (error) {
      console.error('Error fetching bulk interactions:', error);
    }
  }, []);

  return (
    <TweetInteractionsContext.Provider
      value={{
        interactions,
        fetchTweetInteractions: handleFetchInteractions,
        fetchTweetInteractionsInBulk: handleFetchBulkInteractions,
      }}
    >
      {children}
    </TweetInteractionsContext.Provider>
  )
}

export const useTweetInteractionsContext = () => {
  const context = useContext(TweetInteractionsContext);
  if (!context) {
    throw new Error('useTweetInteractionsContext must be used within a TweetInteractionsProvider');
  }
  return context;
}
