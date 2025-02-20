'use client'

import { Tweet } from '@/types/tweet'
import { TweetCard } from './tweet/TweetCard'

interface ProfileTweetListProps {
  initialTweets: Tweet[]
  userId?: string
}

export default function ProfileTweetList({ initialTweets, userId }: ProfileTweetListProps) {
  return (
    <div className="divide-y divide-[#2F3336]">
      {initialTweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
      {initialTweets.length === 0 && (
        <div className="p-4 text-center text-gray-500">No tweets yet</div>
      )}
    </div>
  )
}
