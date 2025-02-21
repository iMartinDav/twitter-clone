'use client'

import { Tweet } from '@/types/tweet'
import { TweetCard } from './tweet/TweetCard'
import { useRealtimeTweets } from '@/hooks/use-realtime-tweets'

interface ProfileTweetListProps {
  initialTweets: Tweet[]
  userId?: string
}

export default function ProfileTweetList({ initialTweets, userId }: ProfileTweetListProps) {
  const { tweets } = useRealtimeTweets(initialTweets)

  return (
    <div className="divide-y divide-[#2F3336]">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
      {tweets.length === 0 && (
        <div className="p-4 text-center text-gray-500">No tweets yet</div>
      )}
    </div>
  )
}
