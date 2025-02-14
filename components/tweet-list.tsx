import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import TweetCard from './tweet-card'

interface Tweet {
  id: string
  content: string
  created_at: string
  user: {
    name: string
    username: string
  }
}

export default function TweetList({ initialTweets }: { initialTweets: Tweet[] }) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime tweets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tweets' }, (payload) => {
        const newTweet = payload.new as Tweet
        setTweets((currentTweets) => [newTweet, ...currentTweets])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  )
}
