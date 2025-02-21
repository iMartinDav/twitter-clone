'use client'

import { TweetCard } from '@/components/tweet/TweetCard'
import { organizeTweetsIntoThreads } from '@/utils/organize-tweets'
import type { Tweet } from '@/types/tweet'

interface ProfileTweetListProps {
  initialTweets: Tweet[]
  userId: string
}

export default function ProfileTweetList({ initialTweets, userId }: ProfileTweetListProps) {
  if (!initialTweets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <p className="text-center">No tweets yet</p>
      </div>
    )
  }

  const { topLevelTweets, threadMap } = organizeTweetsIntoThreads(initialTweets)

  return (
    <div className="divide-y divide-[#2F3336]">
      {topLevelTweets.map((tweet) => {
        const replies = threadMap.get(tweet.id) || []
        
        return (
          <div key={tweet.id} className="group">
            <TweetCard tweet={tweet} />
            {replies.length > 0 && (
              <div className="relative ml-[40px] space-y-0">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#2F3336]" />
                {replies.map((reply) => (
                  <TweetCard
                    key={reply.id}
                    tweet={reply}
                    variant="compact"
                    className="pt-0 hover:bg-white/5"
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
