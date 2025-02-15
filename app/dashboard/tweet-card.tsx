// app/dashboard/tweet-card.tsx
'use client'

import { useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { MessageSquare, Heart, Repeat2, Share } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TweetActionButton } from '@/components/tweet/tweet-action-button'
import { useAuth } from '@/contexts/auth-context'
import { useTweetInteractions } from '@/hooks/use-tweet-interactions'

import type { Tweet } from '@/types/tweet'

interface TweetCardProps {
  tweet: Tweet
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const router = useRouter()
  const { user } = useAuth()
  const { interactions, handleLike } = useTweetInteractions()

  const getAvatarFallback = useCallback((name?: string) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }, [])

  const renderAvatar = useCallback(
    (avatarUrl: string | null | undefined, fullName?: string, className = 'h-12 w-12') => (
      <Avatar
        className={`${className} border-2 border-transparent hover:border-[#59F6E8] transition-all`}
      >
        <AvatarImage
          src={avatarUrl || undefined}
          className="object-cover"
          alt={fullName || 'Profile picture'}
        />
        <AvatarFallback className="bg-[#352f4d] text-white text-lg">
          {getAvatarFallback(fullName)}
        </AvatarFallback>
      </Avatar>
    ),
    [getAvatarFallback],
  )

  return (
    <div className="p-4 hover:bg-muted/10 transition-colors group/tweet">
      <div className="flex gap-4">
        {renderAvatar(tweet.user.avatar_url, tweet.user.full_name)}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-white truncate hover:underline cursor-pointer">
              {tweet.user.full_name}
            </span>
            <span className="text-gray-500 truncate">@{tweet.user.username}</span>
            <span className="text-gray-500">·</span>
            <time className="text-gray-500" dateTime={tweet.created_at}>
              {format(new Date(tweet.created_at), 'MMM d')}
            </time>
          </div>

          <p className="text-white mt-1 break-words">{tweet.content}</p>

          <div className="flex items-center justify-between mt-3">
            <TweetActionButton
              icon={MessageSquare}
              label="Reply"
              count={interactions[tweet.id]?.replies?.length}
              hoverColor="hover:text-blue-400"
              onClick={() => router.push(`/tweet/${tweet.id}`)}
            />
            <TweetActionButton
              icon={Repeat2}
              label="Retweet"
              count={interactions[tweet.id]?.retweets?.length}
              hoverColor="hover:text-green-400"
            />
            <TweetActionButton
              icon={Heart}
              label="Like"
              count={interactions[tweet.id]?.likes?.length}
              isActive={interactions[tweet.id]?.likes?.some((like) => like.user_id === user?.id)}
              activeColor="text-red-400"
              hoverColor="hover:text-red-400"
              onClick={() => user?.id && handleLike(tweet.id, user.id)}
            />
            <TweetActionButton icon={Share} label="Share" hoverColor="hover:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
