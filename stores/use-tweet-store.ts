import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'

interface TweetStore {
  tweets: Tweet[]
  isLoading: boolean
  addTweet: (tweet: Tweet) => void
  removeTweet: (tweetId: string) => void
  setTweets: (tweets: Tweet[]) => void
  fetchTweets: () => Promise<void>
  subscribeToTweets: () => () => void
}

const supabase = createClientComponentClient<Database>()

export const useTweetStore = create<TweetStore>((set, get) => ({
  tweets: [],
  isLoading: false,
  
  addTweet: (tweet) => set((state) => ({ 
    tweets: [tweet, ...state.tweets] 
  })),
  
  removeTweet: (tweetId) => set((state) => ({
    tweets: state.tweets.filter((t) => t.id !== tweetId)
  })),
  
  setTweets: (tweets) => set({ tweets }),
  
  fetchTweets: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*, user:profiles(full_name, username, avatar_url)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ tweets: data as Tweet[] })
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  subscribeToTweets: () => {
    const channel = supabase
      .channel('tweets-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tweets'
      }, async (payload) => {
        const currentTweets = get().tweets

        if (payload.eventType === 'INSERT') {
          const { data: newTweet } = await supabase
            .from('tweets')
            .select('*, user:profiles(full_name, username, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (newTweet) {
            get().addTweet(newTweet as Tweet)
          }
        }

        if (payload.eventType === 'DELETE') {
          get().removeTweet(payload.old.id)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
