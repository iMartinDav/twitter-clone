'use client'

import { TweetCard } from '@/components/tweet/TweetCard'
import { organizeTweetsIntoThreads } from '@/utils/organize-tweets'
import type { Tweet } from '@/types/tweet'

interface FeedTweetListProps {
  tweets: Tweet[]
  isLoading?: boolean
}

export default function FeedTweetList({ tweets, isLoading = false }: FeedTweetListProps) {
  if (isLoading) {
    return <div className="animate-pulse">Loading tweets...</div>
  }

  if (!Array.isArray(tweets) || tweets.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No tweets to display
      </div>
    )
  }

  const { topLevelTweets, threadMap } = organizeTweetsIntoThreads(tweets)

  return (
    <div className="divide-y divide-[#2F3336]">
      {topLevelTweets.map((tweet) => {
        const replies = threadMap.get(tweet.id) || []
        
        return (
          <div key={tweet.id} className="group">
            <TweetCard tweet={tweet} />
            {replies.length > 0 && (
              <div className="ml-[40px] pl-5 border-l border-[#2F3336]">
                {replies.map((reply, index) => (
                  <div 
                    key={reply.id}
                    className={`
                      relative
                      ${index !== replies.length - 1 ? 'border-l border-[#2F3336]' : ''}
                      ml-5
                    `}
                  >
                    <TweetCard
                      tweet={reply}
                      variant="compact"
                      className="hover:bg-white/5"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
