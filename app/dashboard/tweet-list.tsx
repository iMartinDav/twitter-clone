// app/dashboard/tweet-list.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'


import { Tweet } from '@/types/tweet'
import { TweetCard } from '@/components/tweet/TweetCard'

export default function TweetList() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const supabase = createClientComponentClient()

  const loadTweets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tweets')
        .select('*, user:profiles(full_name, username, avatar_url)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTweets((data as Tweet[]) || [])
    } catch (error: any) {
      console.error('Error loading tweets:', error.message)
    }
  }, [supabase])

  useEffect(() => {
    loadTweets()

    const channel = supabase
      .channel('realtime-tweets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets',
        },
        (payload) => {
          setTweets((prev) => [payload.new as Tweet, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, loadTweets])

  if (!tweets.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No tweets yet. Be the first to tweet!
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}
