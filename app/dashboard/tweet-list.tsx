'use client'

import { TweetCard } from '@/components/tweet/TweetCard'
import type { Tweet } from '@/types/tweet'

interface TweetListProps {
  tweets: Tweet[]
  isLoading?: boolean
}

export default function TweetList({ tweets, isLoading = false }: TweetListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading tweets...</div>
      </div>
    )
  }

  if (!Array.isArray(tweets) || tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <p className="text-center">No tweets yet. Be the first one to tweet!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#2F3336]">
      {tweets.map((tweet) => (
        <TweetCard 
          key={tweet.id} 
          tweet={tweet}
        />
      ))}
    </div>
  )
}
