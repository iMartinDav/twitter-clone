'use client'

import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TweetActions } from './TweetActions'
import type { Tweet, TweetWithReplies } from '@/types/tweet'

interface TweetDetailCardProps {
  tweet: Tweet | TweetWithReplies
}

export function TweetDetailCard({ tweet }: TweetDetailCardProps) {
  const userData = tweet.user || tweet.profiles

  return (
    <article className="p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage
            src={userData.avatar_url || undefined}
            alt={userData.full_name}
            className="object-cover"
          />
          <AvatarFallback>{userData.full_name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white hover:underline">
              {userData.full_name}
            </span>
            <span className="text-gray-500">@{userData.username}</span>
          </div>
        </div>
      </div>

      <p className="text-xl text-white whitespace-pre-wrap break-words">
        {tweet.content}
      </p>

      <div className="text-gray-500">
        {format(new Date(tweet.created_at), 'h:mm a · MMM d, yyyy')}
      </div>

      <div className="pt-4 border-t border-[#2F3336]">
        <TweetActions tweetId={tweet.id} variant="detailed" />
      </div>
    </article>
  )
}
