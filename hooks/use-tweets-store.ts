import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import type { Tweet } from '@/types/tweet'

interface TweetsState {
  tweets: Tweet[]
  addTweet: (tweet: Tweet) => void
  removeTweet: (id: string) => void
  setTweets: (tweets: Tweet[]) => void
  subscribeToTweets: () => () => void
}

const supabase = createClientComponentClient<Database>()

export const useTweetsStore = create<TweetsState>((set, get) => ({
  tweets: [],
  
  addTweet: (tweet) => {
    set((state) => ({
      tweets: [tweet, ...state.tweets]
    }))
  },
  
  removeTweet: (id) => {
    set((state) => ({
      tweets: state.tweets.filter((t) => t.id !== id)
    }))
  },
  
  setTweets: (tweets) => set({ tweets }),
  
  subscribeToTweets: () => {
    const channel = supabase
      .channel('tweets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tweets' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('tweets')
              .select('*, profiles(*)')
              .eq('id', payload.new.id)
              .single()
            
            if (data) {
              get().addTweet({
                ...data,
                user: data.profiles,
                likes_count: [{ count: 0 }],
                user_has_liked: []
              } as Tweet)
            }
          }
          
          if (payload.eventType === 'DELETE') {
            get().removeTweet(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}))
