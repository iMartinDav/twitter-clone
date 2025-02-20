'use client'
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TweetActions } from './TweetActions'
import { useTweetInteractions } from '@/contexts/tweet-interactions-context'
import type { Tweet } from '@/types/tweet'

interface TweetCardProps {
  tweet: Tweet
  className?: string
  variant?: 'default' | 'compact'
  replyCount?: number
  replies?: Tweet[]
}

export const TweetCard: React.FC<TweetCardProps> = React.memo<TweetCardProps>(({ 
  tweet, 
  className = '',
  variant = 'default',
  replyCount,
  replies
}) => {
  const router = useRouter()
  const { fetchTweetInteractions } = useTweetInteractions()

  // Prefetch interactions when card mounts
  useEffect(() => {
    fetchTweetInteractions(tweet.id)
  }, [tweet.id, fetchTweetInteractions])

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on an action button
    if ((e.target as HTMLElement).closest('button')) {
      e.stopPropagation()
      return
    }
    router.push(`/tweet/${tweet.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 hover:bg-white/5 border-b border-[#2F3336] cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 border-2 border-transparent hover:border-[#59F6E8] transition-all">
          <AvatarImage src={tweet.user.avatar_url ?? undefined} className="object-cover" />
          <AvatarFallback className="bg-[#352f4d] text-white">
            {tweet.user.full_name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-white truncate">{tweet.user.full_name}</span>
            <span className="text-gray-500 truncate">@{tweet.user.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500" dateTime={tweet.created_at}>
              {format(new Date(tweet.created_at), 'MMM d')}
            </time>
          </div>

          <p className="text-white mt-1 break-words">{tweet.content}</p>

          <TweetActions
            tweetId={tweet.id}
            className="mt-3"
            variant={variant}
            onClick={(e) => e.stopPropagation()} // Prevent event bubbling
          />
        </div>
      </div>
    </motion.div>
  )
})

TweetCard.displayName = 'TweetCard'
