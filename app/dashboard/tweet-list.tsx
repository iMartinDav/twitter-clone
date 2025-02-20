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
        .select(`
          *,
          user:profiles(full_name, username, avatar_url),
          replies!replies_tweet_id_fkey(
            id,
            user_id,
            content,
            created_at,
            profile:profiles(full_name, username, avatar_url)
          )
        `)
        .is('reply_to', null) // Only get main tweets, not replies
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to include replies count and info
      const tweetsWithReplies = (data || []).map(tweet => ({
        ...tweet,
        isReply: false,
        replyCount: tweet.replies?.length || 0,
        replies: tweet.replies || []
      }))

      setTweets(tweetsWithReplies as Tweet[])
    } catch (error: any) {
      console.error('Error loading tweets:', error.message)
    }
  }, [supabase])

  useEffect(() => {
    loadTweets()

    // Listen for new tweets
    const tweetsChannel = supabase
      .channel('realtime-tweets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tweets',
          filter: 'reply_to=is.null' // Only listen for main tweets
        },
        (payload) => {
          setTweets((prev) => [{
            ...payload.new as Tweet,
            isReply: false,
            replyCount: 0,
            replies: []
          }, ...prev])
        },
      )
      .subscribe()

    // Listen for new replies
    const repliesChannel = supabase
      .channel('realtime-replies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'replies'
        },
        async (payload) => {
          // Update the reply count for the parent tweet
          setTweets(prev => prev.map(tweet => {
            if (tweet.id === payload.new.tweet_id) {
              const newReply: Tweet = {
                id: payload.new.id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                user_id: payload.new.user_id,
                profile: payload.new.profile,
                isReply: true,
                replyCount: 0,
                replies: []
              };
              return {
                ...tweet,
                replyCount: (tweet.replyCount || 0) + 1,
                replies: [...(tweet.replies || []), newReply]
              }
            }
            return tweet
          }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tweetsChannel)
      supabase.removeChannel(repliesChannel)
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
        <TweetCard 
          key={tweet.id} 
          tweet={tweet}
          replyCount={tweet.replyCount}
          replies={tweet.replies}
        />
      ))}
    </div>
  )
}
